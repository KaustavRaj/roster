module.exports = function (mongoose) {
  const modelName = "stages";
  const subSchema = new mongoose.Schema(
    {
      id: mongoose.Schema.Types.ObjectId,
      position: Number,
    },
    { _id: false }
  );

  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      tasks: [subSchema],
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
