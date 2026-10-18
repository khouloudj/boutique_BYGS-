// À utiliser APRÈS isAuth() : router.post("/", isAuth(), isAdmin, ...)
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send({ msg: "Admin only" });
  }
  next();
};
