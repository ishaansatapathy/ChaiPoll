import jwt from "jsonwebtoken";
import { getJwtCookieOptions } from "./jwtCookieOptions.js";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, getJwtCookieOptions());
};

export default generateToken;
