const { KakaoUser } = require("../models/UserModels");

exports.updateCategory = async (req, res) => {
  const { userId, categories } = req.body;

  if (!userId || !categories) {
    return res.status(400).send({ message: "Missing required fields" });
  }

  try {
    const user = await KakaoUser.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // 카테고리를 업데이트합니다.
    user.category = categories;
    await user.save();

    res.status(200).send({
      message: "Category updated successfully",
      userInfo: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        category: user.category,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
