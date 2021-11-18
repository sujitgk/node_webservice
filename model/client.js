const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  client_name: { type: String, default: null },
  summary: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, unique: true }
});

module.exports = mongoose.model("client", clientSchema);