package com.elc.system.modules.sms.validation;

import com.elc.system.modules.sms.dto.ClassScheduleDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator implementation for ValidScheduleTime annotation
 * Checks that start time is before end time
 */
public class ValidScheduleTimeValidator implements ConstraintValidator<ValidScheduleTime, ClassScheduleDto.ScheduleRequest> {

    @Override
    public void initialize(ValidScheduleTime annotation) {
    }

    @Override
    public boolean isValid(ClassScheduleDto.ScheduleRequest request, ConstraintValidatorContext context) {
        // If either time is null, let other validators handle it
        if (request == null || request.getStartTime() == null || request.getEndTime() == null) {
            return true;
        }

        // Validate that start time is strictly before end time
        return request.getStartTime().isBefore(request.getEndTime());
    }
}
