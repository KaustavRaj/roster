// boards-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

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

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongoose.modelNames().includes(modelName)) {
    mongoose.deleteModel(modelName);
  }
  return mongoose.model(modelName, schema);
};
