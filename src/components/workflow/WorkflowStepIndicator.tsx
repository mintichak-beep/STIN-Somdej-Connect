import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';
import { WorkflowStep } from '../../types/workflow';

interface Props {
  steps: WorkflowStep[];
  activeStep: number;
}

export function WorkflowStepIndicator({ steps, activeStep }: Props) {
  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      {steps.map((step) => (
        <Step key={step.id}>
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
