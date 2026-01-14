
import React from 'react';
import { MathTopic } from './types';

export const MATH_TOPICS: MathTopic[] = [
  { id: 'arithmetic', title: 'Arithmetic', description: 'Basic operations, fractions, and decimals.', icon: '➕', color: 'bg-blue-500' },
  { id: 'algebra', title: 'Algebra', description: 'Equations, variables, and polynomials.', icon: '𝓍', color: 'bg-indigo-500' },
  { id: 'geometry', title: 'Geometry', description: 'Shapes, angles, and theorems.', icon: '📐', color: 'bg-emerald-500' },
  { id: 'calculus', title: 'Calculus', description: 'Limits, derivatives, and integrals.', icon: '∫', color: 'bg-purple-500' },
  { id: 'statistics', title: 'Statistics', description: 'Probability, data, and distributions.', icon: '📊', color: 'bg-orange-500' },
];
