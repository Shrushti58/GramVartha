const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "GramVartha Backend Running",
  });
};

module.exports = {
  getHealth,
};
