// guard that requires req.user to be a coordinator
module.exports = function(req, res, next) {
  if (!req.user || !req.user.isCoordinator) {
    return res.status(403).json({ message: 'Coordinator access required' });
  }
  next();
};