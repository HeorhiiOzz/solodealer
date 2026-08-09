module.exports = async (req, res) => {
  res.status(200).json({ storage: !!process.env.BLOB_READ_WRITE_TOKEN });
};
