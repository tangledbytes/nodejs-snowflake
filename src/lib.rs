mod utils;

use crate::utils::{ current_time, random };
use serde::{ Serialize, Deserialize };
use wasm_bindgen::prelude::*;
use std::sync::atomic::{ AtomicU64, AtomicU16, Ordering };

//// GLOBAL CONSTANTS ///////////////////////////////////////////////////////////////////////

/// TOTAL_BITS is the total number of bits that
/// the ID can have
const TOTAL_BITS: u64 = 64;

/// EPOCH_BITS is the total number of bits that
/// are occupied by the UNIX timestamp
const EPOCH_BITS: u64 = 42;

/// INSTANCE_ID_BITS is the total number of bits that
/// are occupied by the node id
const INSTANCE_ID_BITS: u64 = 12;

/// SEQUENCE_BITS is the total number of bits that
/// are occupied by the sequence ids
const SEQUENCE_BITS: u64 = 10;

const MAX_INSTANCE_ID: u16 = (1 << INSTANCE_ID_BITS) - 1;
const MAX_SEQUENCE: u16 = (1 << SEQUENCE_BITS) - 1;

//// CUSTOM TYPESCRIPT EXPORTS //////////////////////////////////////////////////////////////
#[wasm_bindgen(typescript_custom_section)]
const CUSTOM_TS: &'static str =
    r#"
export interface SnowflakeOpts {
    custom_epoch?: number; 
    instance_id?: number;
}
"#;

//// HELPER TYPES //////////////////////////////////////////////////////////////////////////
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "SnowflakeOpts")]
    pub type SnowflakeOpts;
}

impl From<SnowflakeConfig> for SnowflakeOpts {
    fn from(cfg: SnowflakeConfig) -> Self {
        Self::from(JsValue::from_serde(&cfg).unwrap())
    }
}

#[derive(Serialize, Deserialize)]
pub struct SnowflakeConfig {
    pub custom_epoch: Option<u64>,
    pub instance_id: Option<u16>,
}

//// CORE IMPLEMENTATION ///////////////////////////////////////////////////////////////////
#[wasm_bindgen]
#[derive(Debug)]
pub struct Snowflake {
    last_timestamp: AtomicU64,
    custom_epoch: u64,
    sequence: AtomicU16,
    instance_id: u16,
}

#[wasm_bindgen]
impl Snowflake {
    #[wasm_bindgen(constructor)]
    /// Constructs a Snowflake object which stores method for generation
    /// of a unique 64 bit time sortable ID
    pub fn new(opts: Option<SnowflakeOpts>) -> Result<Snowflake, JsValue> {
        let custom_epoch = opts
            .as_ref()
            .and_then(|o| { o.into_serde::<SnowflakeConfig>().ok() })
            .and_then(|cfg| cfg.custom_epoch)
            .unwrap_or_else(|| current_time(0));

        let instance_id = opts
            .as_ref()
            .and_then(|o| { o.into_serde::<SnowflakeConfig>().ok() })
            .and_then(|cfg| cfg.instance_id)
            .unwrap_or_else(|| random(MAX_INSTANCE_ID as f64) as u16);

        // If passed instance ID is greater than the max then return error
        if instance_id > MAX_INSTANCE_ID {
            return Err(
                JsValue::from_str(&format!("instance_id must be between 0 and {}", MAX_INSTANCE_ID))
            );
        }

        Ok(Self {
            last_timestamp: AtomicU64::new(0),
            custom_epoch,
            sequence: AtomicU16::new(0),
            instance_id: instance_id & MAX_INSTANCE_ID,
        })
    }

    #[wasm_bindgen(js_name = getUniqueID)]
	/// getUniqueID generates a 64 bit unique ID
    /// 
    /// NOTE: This method is blocking in nature, the function also
    /// has theorotical limit of generating 1,024,000 IDs/sec
    pub fn get_unique_id(&self) -> u64 {
        let mut current_timestamp;
        loop {
            current_timestamp = current_time(self.custom_epoch);
            let last_timestamp = self.last_timestamp.load(Ordering::SeqCst);

            if current_timestamp == last_timestamp {
                let sequence = self.sequence.fetch_add(1, Ordering::SeqCst) & MAX_SEQUENCE;
                if sequence == 0 {
                    // If sequence is 0, it means we've exhausted the sequence numbers for this timestamp
                    // Wait until the next millisecond to get a new timestamp
                    while current_time(self.custom_epoch) == last_timestamp {}
                    continue;
                }
                break;
            } else if
                self.last_timestamp
                    .compare_exchange(
                        last_timestamp,
                        current_timestamp,
                        Ordering::SeqCst,
                        Ordering::Relaxed
                    )
                    .is_ok()
            {
                // Successfully moved to new timestamp, reset sequence
                self.sequence.store(0, Ordering::SeqCst);
                break;
            }
        }

        let id =
            (current_timestamp << (TOTAL_BITS - EPOCH_BITS)) |
            ((self.instance_id as u64) << (TOTAL_BITS - EPOCH_BITS - INSTANCE_ID_BITS)) |
            (self.sequence.load(Ordering::SeqCst) as u64);

        id
    }

    #[wasm_bindgen(js_name = idFromTimestamp)]
	/// idFromTimestamp takes a UNIX timestamp without any offset
    /// and returns an ID that has timestamp set to the given timestamp
    pub fn id_from_timestamp(&self, timestamp: f64) -> u64 {
        let timestamp = (timestamp.round() as u64) - self.custom_epoch;

        let mut id: u64 = timestamp << (TOTAL_BITS - EPOCH_BITS);
        id |= u64::from(self.instance_id) << (TOTAL_BITS - EPOCH_BITS - INSTANCE_ID_BITS);

        id
    }

    #[wasm_bindgen(js_name = instanceID)]
	/// instanceID returns the current node id
    pub fn instance_id(&self) -> f64 {
        self.instance_id as f64
    }

    #[wasm_bindgen(js_name = customEpoch)]
	/// customEpoch returns the current custom epoch
    pub fn custom_epoch(&self) -> f64 {
        self.custom_epoch as f64
    }
}

#[wasm_bindgen]
impl Snowflake {
    #[wasm_bindgen(js_name = timestampFromID)]
	/// timestampFromID takes a unique ID and returns the timestamp
    /// when the Unique ID was created
    pub fn timestamp_from_id(unique_id: u64, epoch_offset: f64) -> f64 {
        ((unique_id >> (TOTAL_BITS - EPOCH_BITS)) as f64) + (epoch_offset as f64)
    }

    #[wasm_bindgen(js_name = instanceIDFromID)]
	/// instanceIDFromID takes a unique ID and returns the instance
    /// ID where the unique ID was created
    /// 
    /// NOTE: The unique ID could be created on ANY instance
    pub fn instance_id_from_id(unique_id: u64) -> i32 {
        let bits = TOTAL_BITS - EPOCH_BITS - INSTANCE_ID_BITS;
        ((unique_id >> bits) & ((1 << INSTANCE_ID_BITS) - 1)) as i32
    }
}
