import { parsePhoneNumberFromString } from "libphonenumber-js";

function verifyPhone({ phone, country }) {
  const phoneNumber = parsePhoneNumberFromString(phone, country);
  if (!phoneNumber || !phoneNumber.isValid()) {
      return {
          valid: false,
          message: "Phone number doesn't match the country"
      };
  };
  return {
    valid: true,
    countryCode: phoneNumber.country,
    countryName: phoneNumber.country,
    callingCode: phoneNumber.countryCallingCode,
    international: phoneNumber.formatInternational(),
  };
};

export default verifyPhone;