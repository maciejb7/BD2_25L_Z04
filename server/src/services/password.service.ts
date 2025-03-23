export class PasswordService {
  static isPasswordValid(password: string): boolean | string {
    if (password.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków.";
    }

    if (password.length > 50) {
      return "Hasło może mieć maksymalnie 50 znaków.";
    }

    if (!/[a-z]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną małą literę.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną wielką literę.";
    }

    if (!/[0-9]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną cyfrę.";
    }

    if (!/[!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`|\\]/.test(password)) {
      return "Hasło musi zawierać co najmniej jeden znak specjalny.";
    }

    return true;
  }

  static getPasswordStrength(password: string): number {
    return 1;
  }
}
