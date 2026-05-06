export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface StartupStep {
    name: string;
    status: StepStatus;
    message?: string;
    logs?: string;
}

export interface StartupStatus {
    steps: StartupStep[];
    is_ready: boolean;
}
