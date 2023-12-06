const User = require("../models/user");
const Blog = require("../models/blog");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const blog = require("../models/blog");
const { errorHandler } = require("../helpers/dbErrorHandler");

// SendGrid
const sgMail = require("@sendgrid/mail"); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const _ = require("lodash");

// Google_auth_library
const { OAuth2Client } = require("google-auth-library");
const { response } = require("express");

exports.preSignup = (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: "Email is already taken",
      });
    }
    // Generate a JWT token and send to client
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "10m",
      }
    );

    console.log(`${process.env.CLIENT_URL}/auth/account/activate/${token}`)
    // email
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email, // Enter email taht was verified from sendgrid
      subject: `Account Activation Link`,
      html: `
              <p>Please use the following link to activate your Account:</p>
              <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
              <hr />
              <p>This email may contain sensetive information</p>
              <p>https://seoblog.com</p>
          `,
    };

    
    return res.json({
      message: `Check Backend Logs for the authentication url or visit ${process.env.CLIENT_URL}/auth/account/activate/${token}`,
    });
    
  });
};

// exports.signup = (req, res) => {
//   User.findOne({ email: req.body.email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({
//         error: "Email is taken.",
//       });
//     }

//     const { name, email, password } = req.body;
//     let username = shortId.generate();
//     let profile = `${process.env.CLIENT_URL}/profile/${username}`;

//     let newUser = new User({ name, email, password, profile, username });
//     newUser.save((err, success) => {
//       if (err) {
//         return res.status(400).json({
//           error: err,
//         });
//       }
//       // res.json({
//       //     user: success
//       // })
//       res.json({
//         message: "Signup success! Please signin.",
//       });
//     });
//   });
// };

exports.signup = (req, res) => {
  const token = req.body.token;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: "Expired link. SignUp again.",
          });
        }
        const { name, email, password } = jwt.decode(token);
        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;

        const user = new User({ name, email, password, profile, username });

        user.save((err, user) => {
          if (err) {
            return res.status(401).json({
              error: errorHandler(err),
            });
          }
          return res.json({
            message: "SignUp Successs! Please SignIn",
          });
        });
      }
    );
  } else {
    return res.json({
      message:
        "Something went wrong. Try again & if the problem persists contact admin",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup.",
      });
    }

    // Authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and Password do not match.",
      });
    }

    // Generate a JWT token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { expiresIn: "1d" });

    const { _id, username, name, email, role } = user;
    return res.json({
      token,
      user: { _id, username, name, email, role },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout successful.",
  });
};

// !!!-----Will be used as middleware for protected routes-----!!!
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.authMiddleWare = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.adminMiddleWare = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (user.role !== 1) {
      return res.status(400).json({
        error: "Admin resource. Access denied",
      });
    }
    req.profile = user;
    next();
  });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let authorizedUser =
      data.postedBy._id.toString() === req.profile._id.toString();
    if (!authorizedUser) {
      return res.status(400).json({
        error: "You are not authorized",
      });
    }
    next();
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: "User with that email does not exist",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10min",
    });

    // email
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email, // Enter email taht was verified from sendgrid
      subject: `Password Reset Link`,
      html: `
              <p>Please use the following link to reset the password:</p>
              <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
              <hr />
              <p>This email may contain sensetive information</p>
              <p>https://seoblog.com</p>
          `,
    };

    // populate the db > user > resetPasswordLink
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ error: errorHandler(err) });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            return res.json({
              message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10 min`,
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: "Expired link. Try again.",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(401).json({
              error: "Something went wrong. Try agin later.",
            });
          }

          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };

          user = _.extend(user, updatedFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }
            res.json({
              message: `Great! now you can login with your new password`,
            });
          });
        });
      }
    );
  }
};

// Google-Signin
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
  const idToken = req.body.tokenId;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      console.log(response);
      const { email_verified, name, email, jti } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            // console.log(user)
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "1d",
            });

            res.cookie("token", token, { expiresIn: "1d" });

            const { _id, email, name, role, username } = user;

            return res.json({
              token,
              user: { _id, email, name, role, username },
            });
          } else {
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            let password = jti;
            user = new User({ name, email, profile, username, password });

            user.save((err, data) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err),
                });
              }

              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: "1d",
                }
              );

              res.cookie("token", token, { expiresIn: "1d" });

              const { _id, email, name, role, username } = data;

              return res.json({
                token,
                user: { _id, email, name, role, username },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try agin",
        });
      }
    });
};
