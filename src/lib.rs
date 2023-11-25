mod utils;

use crate::utils::{current_time, random};

use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

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
const CUSTOM_TS: &'static str = r#"
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
    last_timestamp: u64,
    custom_epoch: u64,
    sequence: u16,
    instance_id: u16,
}

#[wasm_bindgen]
impl Snowflake {
    #[wasm_bindgen(constructor)]
    /// Constructs a Snowflake object which stores method for generation
    /// of a unique 64 bit time sortable ID
    pub fn new(opts: Option<SnowflakeOpts>) -> Result<Snowflake, JsValue> {
        match opts {
            Some(opts) => {
                match opts.into_serde::<SnowflakeConfig>() {
                    Ok(opts) => {
                        let epoch = opts.custom_epoch.unwrap_or_else(||current_time(0));
                        let instance_id = opts.instance_id.unwrap_or_else(||random(MAX_INSTANCE_ID as f64) as u16);

                        // If passed instance ID is greater than the max then return error
                        if instance_id > MAX_INSTANCE_ID {
                            return Err(JsValue::from_str(&format!("instance_id must be between 0 and {}", MAX_INSTANCE_ID)));
                        }

                        Ok(Self {
                            last_timestamp: 0,
                            custom_epoch: epoch,
                            sequence: 0,
                            instance_id: instance_id & MAX_INSTANCE_ID,
                        })
                    }
                    Err(_) => {
                        Err(JsValue::from_str("[NATIVE]: failed to parse object into SnowflakeOpts"))
                    }
                }
            }
            None => {
                Ok(Self{
                    last_timestamp: 0,
                    custom_epoch: current_time(0),
                    sequence: 0,
                    instance_id: random(MAX_INSTANCE_ID as f64) as u16,
                })
            }
        }
    }

    #[wasm_bindgen(js_name = getUniqueID)]
    /// getUniqueID generates a 64 bit unique ID
    /// 
    /// NOTE: This method is blocking in nature, the function also
    /// has theorotical limit of generating 1,024,000 IDs/sec
    pub fn get_unique_id(&mut self) -> u64 {
        let mut current_timestamp = current_time(self.custom_epoch);

        if current_timestamp == self.last_timestamp {
            self.sequence = (self.sequence + 1) & MAX_SEQUENCE;

            // If we have exhausted all of the sequence number as well
            if self.sequence == 0 {
                // Wait for roughly a millisecond
                while current_time(self.custom_epoch) - current_timestamp < 1 {}
                
                // Update timestamp by one
                current_timestamp += 1;
            }
        } else {
            // Reset the sequence
            self.sequence = 0;
        }

        self.last_timestamp = current_timestamp;

        let mut id: u64 = current_timestamp << (TOTAL_BITS - EPOCH_BITS);
        id |= (self.instance_id as u64) << (TOTAL_BITS - EPOCH_BITS - INSTANCE_ID_BITS);
        id |= self.sequence as u64;

        id
    }

    #[wasm_bindgen(js_name = idFromTimestamp)]
    /// idFromTimestamp takes a UNIX timestamp without any offset
    /// and returns an ID that has timestamp set to the given timestamp
    pub fn id_from_timestamp(&self, timestamp: f64) -> u64 {
        let timestamp = timestamp.round() as u64 - self.custom_epoch;

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
        let bits = TOTAL_BITS - INSTANCE_ID_BITS - SEQUENCE_BITS;
        ((unique_id << bits) >> (bits + SEQUENCE_BITS)) as i32
    }
}