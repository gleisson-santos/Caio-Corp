export default function PageHeader({ title, description, action }) {
  return (
    <div className="page-header fade-in-up">
      <div className="page-header-content">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action && <div className="page-header-action">{action}</div>}
      </div>
    </div>
  )
}
