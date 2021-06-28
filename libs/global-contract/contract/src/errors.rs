pub const GUILD_ID_NOT_REGISTERED: &str = "The requested guild ID has not been registered";
pub const UNAUTHORIZED: &str = "This action requires admin privileges";
pub const INVALID_ACCOUNT_ID: &str = "new account id is invalid!";
pub const INCORRECT_SIGNATURE: &str = "The signature is incorrect for message";

// pub(crate) fn throw_error(e: &str) {
//     panic!("{}", e);
// }

#[macro_export]
macro_rules! throw_error {
    ($expression:expr) => {
        panic!("{}", $expression);
    };
}
