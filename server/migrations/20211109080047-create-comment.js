"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      project_id: {
        type: Sequelize.INTEGER,
      },
      goal_id: {
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addConstraint("Comments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "Comments_fkey_from_Users",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    await queryInterface.addConstraint("Comments", {
      fields: ["project_id"],
      type: "foreign key",
      name: "Comments_fkey_from_Projects",
      references: {
        table: "Projects",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    await queryInterface.addConstraint("Comments", {
      fields: ["goal_id"],
      type: "foreign key",
      name: "Comments_fkey_from_Goals",
      references: {
        table: "Goals",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Files", "Files_fkey_from_Goals");
    await queryInterface.removeConstraint("Files", "Files_fkey_from_Projects");
    await queryInterface.removeConstraint("Files", "Files_fkey_from_Users");
    await queryInterface.dropTable("Comments");
  },
};