const jwt = require("jsonwebtoken");
const request = require("request");
const { KakaoUser } = require("../models/UserModels");

const KAKAO_TOKEN_API_URL = "https://kapi.kakao.com/v2/user/me";

exports.authenticateKakao = async (req, res) => {
  const accessToken = req.body.accessToken;
  request(
    {
      method: "GET",
      url: KAKAO_TOKEN_API_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    async (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).send("Failed to request user info");
      }

      const userInfo = JSON.parse(body);
      const {
        id: kakaoId,
        properties: { nickname },
        kakao_account: { email },
      } = userInfo;

      try {
        let user = await KakaoUser.findOne({ email });

        if (!user) {
          user = new KakaoUser({
            kakaoId,
            nickname,
            email,
            category: {
              subcategory1: "",
              subcategory2: "",
              subcategory3: "",
              subcategory4: "",
              subcategory5: "",
            },
          });
          await user.save();
        } else {
          user.nickname = nickname;
          await user.save();
        }

        const accessToken = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            nickname: user.nickname,
          },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
          {
            userId: user._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        res.send({
          accessToken,
          refreshToken,
          userInfo: {
            id: user._id,
            email: user.email,
            nickname: user.nickname,
            category: user.category,
          },
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    }
  );
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).send({ message: "Refresh Token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;

    const user = await KakaoUser.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { userId, email: user.email, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      accessToken: newAccessToken,
      userInfo: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        category: user.category,
      },
    });
  } catch (error) {
    res.status(403).send({ message: "Invalid Refresh Token" });
  }
};
