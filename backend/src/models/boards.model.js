module.exports = function (mongoose) {
  const modelName = "boards";
  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      members: [mongoose.Schema.Types.ObjectId],
      stages: [mongoose.Schema.Types.ObjectId],
    },
    {
      timestamps: true,
    }
  );

  if (mongoose.modelNames().includes(modelName)) {
    mongoose.deleteModel(modelName);
  }
  return mongoose.model(modelName, schema);
};
