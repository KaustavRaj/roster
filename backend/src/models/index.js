const mongoose = require("../mongoose");
const Users = require("./users.model")(mongoose);
const Boards = require("./boards.model")(mongoose);
const Stages = require("./stages.model")(mongoose);
const Tasks = require("./tasks.model")(mongoose);

module.exports = { Users, Boards, Stages, Tasks };
