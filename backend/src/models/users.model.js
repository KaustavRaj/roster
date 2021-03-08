module.exports = function (mongoose) {
  const modelName = "users";
  const userSchema = new mongoose.Schema(
    {
      email: { type: String, unique: true, lowercase: true, required: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      boards: [mongoose.Schema.Types.ObjectId],
    },
    {
      timestamps: true,
    }
  );

  if (mongoose.modelNames().includes(modelName)) {
    mongoose.deleteModel(modelName);
  }
  return mongoose.model(modelName, userSchema);
};
