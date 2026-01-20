export type ViewState = 'signin' | 'signup' | 'dashboard';

export interface AuthFormProps {
    onSwitchView: (view: ViewState) => void;
    onLogin: () => void;
}