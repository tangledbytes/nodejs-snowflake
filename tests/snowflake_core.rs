use nodejs_snowflake::{Snowflake, SnowflakeConfig};
use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn create_snowflake_with_no_parameters() {
	let now = js_sys::Date::now();

	let uid = Snowflake::new(None).unwrap();

	let instance_id = uid.instance_id();
	let snowflake_epoch_offset = uid.custom_epoch();
	
	assert!(instance_id > 0.0 && instance_id < 4095.0);
	assert!(snowflake_epoch_offset >= now && now < snowflake_epoch_offset + 2.0)
}

#[wasm_bindgen_test]
fn create_snowflake_with_empty_opts() {
	let opts = SnowflakeConfig{
		custom_epoch: None,
		instance_id: None,
	};
	let now = js_sys::Date::now();

	let uid = Snowflake::new(Some(opts.into())).unwrap();

	let instance_id = uid.instance_id();
	let snowflake_epoch_offset = uid.custom_epoch();
	
	assert!(instance_id > 0.0 && instance_id < 4095.0);
	assert!(snowflake_epoch_offset >= now && now < snowflake_epoch_offset + 2.0)
}

#[wasm_bindgen_test]
fn create_snowflake_with_custom_epoch_only() {
	let custom_epoch: u64 = 1546300800000;

	let opts = SnowflakeConfig{
		custom_epoch: Some(custom_epoch),
		instance_id: None,
	};

	let uid = Snowflake::new(Some(opts.into())).unwrap();

	let instance_id = uid.instance_id();
	let snowflake_epoch_offset = uid.custom_epoch() as u64;
	
	assert!(instance_id > 0.0 && instance_id < 4095.0);
	assert_eq!(snowflake_epoch_offset, custom_epoch);
}

#[wasm_bindgen_test]
fn create_snowflake_with_custom_instance_id_only() {
	let custom_instance_id: u16 = 1234;
	let now = js_sys::Date::now();

	let opts = SnowflakeConfig{
		custom_epoch: None,
		instance_id: Some(custom_instance_id),
	};

	let uid = Snowflake::new(Some(opts.into())).unwrap();

	let instance_id = uid.instance_id();
	let snowflake_epoch_offset = uid.custom_epoch();
	
	assert_eq!(instance_id as u16, custom_instance_id);
	assert!(snowflake_epoch_offset >= now && now < snowflake_epoch_offset + 2.0)
}

#[wasm_bindgen_test]
fn create_snowflake_with_custom_instance_id_and_custom_epoch() {
	let custom_instance_id: u16 = 1234;
	let custom_epoch: u64 = 1546300800000;

	let opts = SnowflakeConfig{
		custom_epoch: Some(custom_epoch),
		instance_id: Some(custom_instance_id),
	};

	let uid = Snowflake::new(Some(opts.into())).unwrap();

	let instance_id = uid.instance_id();
	let snowflake_epoch_offset = uid.custom_epoch() as u64;
	
	assert_eq!(instance_id as u16, custom_instance_id);
	assert_eq!(custom_epoch, snowflake_epoch_offset);
}

#[wasm_bindgen_test]
fn create_snowflake_with_invalid_instance_ids() {
	let custom_instance_ids = [10000, 4096u16];

	for custom_instance_id in custom_instance_ids.iter() {
		let opts = SnowflakeConfig {
			custom_epoch: None,
			instance_id: Some(*custom_instance_id),
		};

		let uid = Snowflake::new(Some(opts.into()));

		assert!(uid.is_err());
	}
}

#[wasm_bindgen_test]
fn verify_timestamp_of_creation() {
	// const ERROR_MARGIN: f64 = 2.0;

	let mut uid = Snowflake::new(None).unwrap();

	let before = js_sys::Date::now();
	let id = uid.get_unique_id();
	let after = js_sys::Date::now();

	let ts = Snowflake::timestamp_from_id(id, uid.custom_epoch());

	assert!(ts >= before && ts <= after);
}

#[wasm_bindgen_test]
fn verify_instance_id() {
	let mut uid = Snowflake::new(None).unwrap();

	let id = uid.get_unique_id();
	let ciid = uid.instance_id() as i32;
	let iid = Snowflake::instance_id_from_id(id);

	assert_eq!(iid, ciid);
}

#[wasm_bindgen_test]
fn generate_id_from_timestamp() {
	let uid = Snowflake::new(None).unwrap();

	let ts = js_sys::Date::now();
	let id = uid.id_from_timestamp(ts);
	let extracted_ts = Snowflake::timestamp_from_id(id, uid.custom_epoch());

	assert!((ts - extracted_ts).abs() < f64::EPSILON);
}

#[wasm_bindgen_test]
fn integrity_test() {
	const SECOND: f64 = 1e3;
	const RUN_FOR_SECONDS: f64 = 1.0;

	let mut uid = Snowflake::new(None).unwrap();
	let mut ids = Vec::new();

	let before = js_sys::Date::now();
	while js_sys::Date::now() - before < RUN_FOR_SECONDS * SECOND {
		ids.push(uid.get_unique_id());
	}

	let mut copy = ids.clone();
	copy.sort_unstable();
	copy.dedup();

	assert_eq!(copy.len(), ids.len());
}