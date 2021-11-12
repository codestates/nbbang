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
      // models.Project.hasMany(models.Goal);
      // models.Project.hasMany(models.Like);
      // models.Project.hasMany(models.Comment);
      // models.Project.hasMany(models.File);
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
