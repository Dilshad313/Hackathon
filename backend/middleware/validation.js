const Joi = require('joi');

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    role: Joi.string().valid('patient', 'doctor', 'hospital').default('patient')
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  
  next();
};

const validateDoctorRegistration = (req, res, next) => {
  const schema = Joi.object({
    licenseNumber: Joi.string().required(),
    specialization: Joi.string().required(),
    bio: Joi.string().max(1000),
    consultationFee: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string().default('USD')
    }),
    languages: Joi.array().items(Joi.string()),
    consultationTypes: Joi.array().items(Joi.string().valid('video', 'audio', 'in-person', 'chat')).required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  
  next();
};

const validateAppointment = (req, res, next) => {
  const schema = Joi.object({
    doctorId: Joi.string().required(),
    appointmentDate: Joi.date().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    consultationType: Joi.string().valid('video', 'audio', 'in-person', 'chat').required(),
    reason: Joi.string().max(500)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  
  next();
};

const validatePrescription = (req, res, next) => {
  const schema = Joi.object({
    appointmentId: Joi.string().required(),
    diagnosis: Joi.string().required(),
    medications: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      dosage: Joi.string().required(),
      frequency: Joi.string().required(),
      duration: Joi.string().required(),
      quantity: Joi.number().required(),
      instructions: Joi.string(),
      refills: Joi.number().default(0)
    })).required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateDoctorRegistration,
  validateAppointment,
  validatePrescription
};