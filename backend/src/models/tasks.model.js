module.exports = function (mongoose) {
  const modelName = "tasks";
  const schema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: String,
      assigned: [mongoose.Schema.Types.ObjectId],
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
