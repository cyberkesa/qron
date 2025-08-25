import type { Meta, StoryObj } from '@storybook/react';
import { SampleForm } from './SampleForm';

const meta: Meta<typeof SampleForm> = {
  title: 'Forms/SampleForm',
  component: SampleForm,
};

export default meta;
type Story = StoryObj<typeof SampleForm>;

export const Default: Story = { args: {} };
