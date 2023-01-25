const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;

const Student = require("../models/student");
const Tutor = require("../models/tutor");
const Admin = require("../models/admin");
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            //search in Student collection
            Student.findById(jwt_payload.id, (err, student) => {
                if (err) {
                    return done(err, null);
                }

                if (student) {
                    return done(null, student);
                } else {
                    //search in Tutor collection
                    Tutor.findById(jwt_payload.id, (err, tutor) => {
                        if (err) {
                            return done(err, null);
                        }
                        if (tutor) {
                            return done(null, tutor);
                        } else {
                            //search in Admin collection
                            Admin.findById(jwt_payload.id, (err, admin) => {
                                if (err) {
                                    return done(err, null);
                                }
                                if (admin) {
                                    return done(null, admin);
                                } else {
                                    return done(null, false);
                                }
                            });
                        }
                    });
                }
            });
        })
    );
};
