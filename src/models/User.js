const { DataTypes } = require("sequelize");
const db = require("../config/db.config");
const bcrypt = require('bcrypt');

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
  },
  
  password: DataTypes.STRING,
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE'),
  },
  failedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userByIdToken: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
}, {
  tableName: 'users',
  timestamps: true,

  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },

  indexes: [
    {
      name: 'idx_user_name',
      fields: ['name'],
    },
    {
      name: 'idx_user_email',
      fields: ['email'],
    },
    {
      name: 'idx_user_menuIds',
      fields: ['menuIds'],
    },
    {
      name: 'idx_user_blockedAt',
      fields: ['blockedAt'],
    },
    {
      name: 'idx_user_createdAt',
      fields: ['createdAt'],
    }
  ],
});

// Hide password in output
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Password check
User.prototype.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

User.associate = function(models) {
  User.hasMany(models.users, {  // models.users because your model name is 'users'
    foreignKey: 'userByIdToken',
    as: 'subUsers',
  });

  User.belongsTo(models.users, {
    foreignKey: 'userByIdToken',
    as: 'parentUser',
  });
};




module.exports = User;