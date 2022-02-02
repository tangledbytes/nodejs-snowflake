use js_sys::{Date, Math};

/// current_time takes an `adjust` parameter which is
/// subtracted from the current UNIX epoch timestamp
pub fn current_time(adjust: u64) -> u64 {
    Date::now().round() as u64 - adjust
}

/// random generates a random number between [0, scale]
pub fn random(scale: f64) -> u64 {
    (Math::random() * scale).round() as u64
}

