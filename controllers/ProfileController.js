class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        status: 200,
        message: "User info",
        user: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
  static async store(req, res) {}
  static async show(req, res) {}
  static async update(req, res) {}
  static async delete(req, res) {}
}

export default ProfileController;
