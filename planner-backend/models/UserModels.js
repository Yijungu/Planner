const mongoose = require("mongoose");

const userSchemaOptions = {
  discriminatorKey: "service", // 'service' 필드를 통해 구분
  collection: "users", // 모든 유저 정보를 하나의 컬렉션에 저장
};

const baseUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    nickname: { type: String, required: true },
    category: {
      1: { type: String, default: "할일1" },
      2: { type: String, default: "할일2" },
      3: { type: String, default: "할일3" },
      4: { type: String, default: "할일4" },
      5: { type: String, default: "할일5" },
    },
  },
  userSchemaOptions
);

const User = mongoose.model("User", baseUserSchema);

const kakaoUserSchema = new mongoose.Schema({
  kakaoId: { type: String, required: true, unique: true },
});

const appleUserSchema = new mongoose.Schema({
  appleId: { type: String, required: true, unique: true },
});

const naverUserSchema = new mongoose.Schema({
  naverId: { type: String, required: true, unique: true },
});

const KakaoUser = User.discriminator("KakaoUser", kakaoUserSchema);
const AppleUser = User.discriminator("AppleUser", appleUserSchema);
const NaverUser = User.discriminator("NaverUser", naverUserSchema);

module.exports = { KakaoUser, AppleUser, NaverUser };
