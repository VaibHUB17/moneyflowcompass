import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware to validate requests using express-validator
 * @param validations array of validation chains from express-validator
 * @returns middleware function that runs validations and handles errors
 */
export const validate = (validations: ValidationChain[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        success: false, 
        error: errors.array().map(err => err.msg).join(', ')
      });
      return;
    }

    next();
  };
};