"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Project.hasMany(models.UsersProjects);
      Project.hasMany(models.Goal);
      Project.hasMany(models.Like);
      Project.hasMany(models.Comment);
      Project.hasMany(models.File);
    }
  }
  Project.init(
    {
      projectName: DataTypes.STRING,
      captainId: DataTypes.INTEGER,
      description: DataTypes.STRING,
      presentation: DataTypes.STRING,
      state: DataTypes.STRING,
      deadline: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Project",
    }
  );
  return Project;
};
