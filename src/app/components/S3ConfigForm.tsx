import React, { useState } from 'react';
import { S3Config } from '../../types/s3-explorer';

interface S3ConfigFormProps {
  onSave: (config: S3Config, password: string) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
  error: string;
  initialConfig?: Partial<S3Config>;
}

export const S3ConfigForm: React.FC<S3ConfigFormProps> = ({
  onSave,
  onCancel,
  isLoading,
  error,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<S3Config>({
    endpoint: initialConfig.endpoint || '',
    accessKeyId: initialConfig.accessKeyId || '',
    secretAccessKey: initialConfig.secretAccessKey || '',
    bucket: initialConfig.bucket || '',
    region: initialConfig.region || 'us-east-1',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleConfigChange = (field: keyof S3Config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      config.endpoint &&
      config.accessKeyId &&
      config.secretAccessKey &&
      config.bucket &&
      config.region &&
      password.length >= 8 &&
      password === confirmPassword
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      await onSave(config, password);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Débil';
    if (passwordStrength <= 4) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración S3 Segura</h2>
        <p className="text-gray-600">
          Configura tu conexión S3 con encriptación AES-256
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración S3 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Configuración S3</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint *
              </label>
              <input
                type="url"
                id="endpoint"
                value={config.endpoint}
                onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://s3.amazonaws.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Región *
              </label>
              <input
                type="text"
                id="region"
                value={config.region}
                onChange={(e) => handleConfigChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="us-east-1"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700 mb-1">
                Access Key ID *
              </label>
              <input
                type="text"
                id="accessKeyId"
                value={config.accessKeyId}
                onChange={(e) => handleConfigChange('accessKeyId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="bucket" className="block text-sm font-medium text-gray-700 mb-1">
                Bucket *
              </label>
              <input
                type="text"
                id="bucket"
                value={config.bucket}
                onChange={(e) => handleConfigChange('bucket', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="mi-bucket"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700 mb-1">
              Secret Access Key *
            </label>
            <input
              type="password"
              id="secretAccessKey"
              value={config.secretAccessKey}
              onChange={(e) => handleConfigChange('secretAccessKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Configuración de Seguridad */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Seguridad</h3>
          
          <div>
            <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Maestra *
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                id="masterPassword"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fortaleza:</span>
                  <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                confirmPassword && password !== confirmPassword 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              placeholder="Repite la contraseña"
              disabled={isLoading}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </div>
            ) : (
              'Guardar Configuración'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Información de Seguridad</h4>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Tus credenciales se encriptan con AES-256 antes de guardarse</li>
              <li>• Solo tú puedes acceder con tu contraseña maestra</li>
              <li>• La contraseña no se almacena, solo se usa para encriptar/desencriptar</li>
              <li>• Usa una contraseña fuerte y única para máxima seguridad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};