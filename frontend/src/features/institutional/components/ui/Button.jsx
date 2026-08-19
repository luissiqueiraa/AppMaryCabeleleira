import { Link } from "react-router-dom";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-[0_8px_24px_-8px_var(--color-primary)]",
  secondary:
    "bg-transparent text-text border border-border hover:border-primary-light",
  ghost: "bg-transparent text-text-muted hover:text-text",
};

export default function Button({
  as,
  to,
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANTS[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  const Component = as || "button";
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
