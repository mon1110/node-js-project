// class User {
//     static getAll() {
//       return ['tcs', 'techrover', 'infotech'];
//     }
//   }

//   module.exports = User;

const { sequelize, DataTypes } = require("sequelize");
const db = require("../config/db.config");
const menu = require("./menu");
const bcrypt = require('bcrypt');

// var User = db.define(
//     "users",
//     {
//         id: { type: sequelize.INTEGER, primaryKey: true },
//         name: { type: sequelize.STRING },
//         email: { type: sequelize.STRING },
//         // token: { type: sequelize.STRING },
//     },
//     {
//         // dont use createdAt/update
//         tableName:'users',
//         timestamps: false,
//     }
// );
// module.exports = User;
// Define the User model
const User = db.define('users', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
          },
    },
    softDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },

    menuIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), 
        allowNull: true,
      },

      password: DataTypes.STRING,
    
      gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE'),
        // allowNull: false,
      },

      // isBlocked: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      failedAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      blockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    
  

}, 
{
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
},  
{
    tableName: 'users', 
    timestamps:true,
});

// Hash password before create
User.beforeCreate(async (user) => {
    if (user.password) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
  });
  
  // ✅ Hash password before update
  User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
  });
  
  // ✅ Hide password from API response
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };
  User.prototype.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  };
  


    
module.exports = User;