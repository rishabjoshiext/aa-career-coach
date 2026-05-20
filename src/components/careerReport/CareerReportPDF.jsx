import { forwardRef, Fragment } from 'react'
import apnaAdvantageLogo from '../../assets/apna-advantage-logo.png'
import './pdfStyles.css'

function ReportHeader() {
  return (
    <div className="cr-header">
      <div className="cr-brand">
        <img
          src={apnaAdvantageLogo}
          alt="apnaadvantage"
          className="cr-brand-logo"
          width={158}
          height={38}
        />
      </div>
    </div>
  )
}

function GrowthChart({ years, maxK }) {
  return (
    <div className="cr-chart" aria-hidden>
      {years.map((row) => (
        <div key={row.year} className="cr-chart-group">
          <div className="cr-bar-grey" style={{ height: `${Math.max(4, (row.stagK / maxK) * 100)}%` }} />
          <div className="cr-bar-green" style={{ height: `${Math.max(4, (row.accelK / maxK) * 100)}%` }} />
          <span className="cr-chart-year">Y{row.year}</span>
        </div>
      ))}
    </div>
  )
}

function PathTimeline({ steps }) {
  return (
    <div className="cr-path-timeline">
      {steps.map((step, i) => (
        <Fragment key={`${step.title}-${i}`}>
          {i > 0 ? (
            <div className="cr-path-connector" aria-hidden>
              <span className="cr-path-line" />
              <svg className="cr-path-arrow" viewBox="0 0 12 12" width="12" height="12" aria-hidden>
                <path d="M2 2 L9 6 L2 10 Z" fill="#7c3aed" />
              </svg>
            </div>
          ) : null}
          <div className="cr-path-step">
            {step.tag ? <div className="cr-path-step-tag">+ Degree</div> : null}
            <p className="cr-path-step-title">{step.title}</p>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

/** Hidden printable layout — single flow document, sliced to A4 pages on export. */
export const CareerReportPDF = forwardRef(function CareerReportPDF({ data }, ref) {
  if (!data) return null

  const {
    displayName,
    firstName,
    destinationTitle,
    industryLabel,
    gapRows,
    roi,
    growthAdvantages,
    pathSteps,
    skills,
    industries,
    roles,
    nextSteps,
    careerOutlook,
    finalInsight,
    specTitle,
  } = data

  return (
    <div ref={ref} className="career-report-root" aria-hidden>
      <div className="career-report-document" data-report-document>
        <ReportHeader />
        <h1 className="cr-title">CAREER TRANSFORMATION PASS</h1>
        <p className="cr-tagline">Your Path. Your Growth. Your Future.</p>

        <div className="cr-profile-card">
          <h2 className="cr-profile-name">{displayName}</h2>
          <p className="cr-profile-sub">You are on your way to a better future.</p>
          <div className="cr-meta-row">
            <span className="cr-meta-label">Future Role</span>
            <span className="cr-meta-value">{destinationTitle}</span>
          </div>
          <div className="cr-meta-row">
            <span className="cr-meta-label">Industry</span>
            <span className="cr-meta-value">{industryLabel}</span>
          </div>
          <div className="cr-meta-row">
            <span className="cr-meta-label">Recommended</span>
            <span className="cr-meta-value">{specTitle}</span>
          </div>
        </div>

        <div className="cr-grid-2">
          <section className="cr-section">
            <h3 className="cr-section-title">Your current gaps</h3>
            {gapRows.map((g) => (
              <div key={g.title} className="cr-gap-item">
                <span className="cr-gap-icon" aria-hidden>
                  {g.icon}
                </span>
                <div className="cr-gap-body">
                  <span className="cr-gap-name">{g.title}</span>
                  <p className="cr-gap-desc">{g.description}</p>
                  {g.chips?.length ? (
                    <div className="cr-gap-chips">
                      {g.chips.map((chip) => (
                        <span key={chip} className="cr-gap-chip">
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <section className="cr-section cr-growth-box">
            <h3 className="cr-section-title">Expected growth with accelerated pathway</h3>
            <p className="cr-salary-big">{roi.expectedBand}</p>
            <p className="cr-salary-sub">Projected annual salary · Year {roi.rYear}</p>
            <p className="cr-legend">Grey = no action · Green = accelerated path</p>
            <GrowthChart years={roi.years} maxK={roi.maxK} />
            <ul className="cr-checklist">
              {growthAdvantages.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="cr-section cr-path-section">
          <h3 className="cr-section-title">Your accelerated pathway</h3>
          <PathTimeline steps={pathSteps} />
        </section>

        <h2 className="cr-subtitle">Your action plan &amp; market outlook</h2>

        <div className="cr-cols-3">
          <section className="cr-section cr-list-section">
            <h3 className="cr-section-title">Skills you will build</h3>
            <ul>
              {skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section className="cr-section cr-list-section cr-industries">
            <h3 className="cr-section-title">Industries hiring</h3>
            <ul>
              {industries.map((ind) => (
                <li key={ind}>{ind}</li>
              ))}
            </ul>
          </section>
          <section className="cr-section cr-list-section cr-roles">
            <h3 className="cr-section-title">Roles you can aim for</h3>
            <ul>
              {roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="cr-section cr-next-steps">
          <h3 className="cr-section-title">Your next steps</h3>
          <div className="cr-steps-row">
            {nextSteps.map((step, i) => (
              <div key={step} className="cr-step">
                <div className="cr-step-num">{i + 1}</div>
                <p className="cr-step-text">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="cr-bottom-2">
          <div className="cr-insight-card cr-outlook">
            <h3 className="cr-insight-title">📈 Career outlook</h3>
            <p className="cr-insight-body">{careerOutlook}</p>
          </div>
          <div className="cr-insight-card cr-final">
            <h3 className="cr-insight-title">⭐ Final insight</h3>
            <p className="cr-insight-body">{finalInsight}</p>
          </div>
        </div>

        <div className="cr-footer-dual">
          <span>Keep going, {firstName}!</span>
          <span>Powered by Apna Advantage Career Coach</span>
        </div>
      </div>
    </div>
  )
})
