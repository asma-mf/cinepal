/**
 * Generates a premium HTML status page for CinePal.
 * @param {string} status - The current status of the system.
 * @returns {string} HTML string.
 */
const getStatusPage = (status = 'operational') => {
  const isOperational = status === 'operational';
  const statusColor = isOperational ? '#10b981' : '#f59e0b';
  const statusBg = isOperational ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';
  const statusText = isOperational ? 'All Systems Operational' : 'Partial System Outage';
  const statusDescription = isOperational 
    ? 'We\'re not aware of any issues affecting our systems at this time.' 
    : 'We are investigating reports of intermittent connectivity issues.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Status | CinePal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #FF2E2E;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg: #ffffff;
            --text: #1f2937;
            --text-muted: #6b7280;
            --border: #e5e7eb;
            --card-bg: #ffffff;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #030712;
                --text: #f9fafb;
                --text-muted: #9ca3af;
                --border: #1f2937;
                --card-bg: #111827;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 2rem 1rem;
        }

        .container {
            max-width: 640px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 1rem 0;
            margin-bottom: 1rem;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .logo svg {
            height: 32px;
            width: auto;
            display: block;
        }

        .btn-subscribe {
            background-color: var(--text);
            color: var(--bg);
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .btn-subscribe:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .status-banner {
            background-color: ${statusBg};
            border: 1px solid ${statusColor};
            padding: 1.5rem;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .status-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: ${statusColor};
            font-size: 1.25rem;
            font-weight: 700;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            background-color: ${statusColor};
            border-radius: 50%;
            position: relative;
        }

        .status-dot::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: ${statusColor};
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
        }

        .status-desc {
            color: var(--text-muted);
            font-size: 0.9375rem;
        }

        .system-status {
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .section-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .section-title {
            font-size: 1.125rem;
            font-weight: 600;
        }

        .time-range {
            font-size: 0.875rem;
            color: var(--text-muted);
        }

        .component-list {
            padding: 0.5rem 0;
        }

        .component-item {
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
        }

        .component-item:last-child {
            border-bottom: none;
        }

        .component-info {
            display: flex;
            flex-direction: column;
        }

        .component-name {
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .component-sub {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .uptime-percent {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-muted);
        }

        .history-btn {
            margin-top: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            width: 100%;
            border: 1px solid var(--border);
            background: transparent;
            border-radius: 8px;
            color: var(--text);
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }

        .history-btn:hover {
            background-color: var(--border);
        }

        footer {
            margin-top: auto;
            padding-top: 4rem;
            color: var(--text-muted);
            font-size: 0.875rem;
            text-align: center;
        }

        .checkmark {
            width: 20px;
            height: 20px;
            fill: ${statusColor};
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">
                <svg width="84" height="21" viewBox="0 0 84 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.192 12.056C10.512 12.056 10.7627 12.1413 10.944 12.312C11.1253 12.472 11.216 12.7013 11.216 13C11.216 13.7573 11.008 14.4453 10.592 15.064C10.176 15.6827 9.59467 16.1733 8.848 16.536C8.10133 16.888 7.25867 17.064 6.32 17.064C5.264 17.064 4.31467 16.8507 3.472 16.424C2.64 15.9973 1.984 15.3787 1.504 14.568C1.03467 13.7467 0.8 12.7813 0.8 11.672C0.8 10.5307 1.02933 9.496 1.488 8.568C1.94667 7.64 2.56533 6.90933 3.344 6.376C4.12267 5.84267 4.976 5.576 5.904 5.576C7.152 5.576 8.11733 5.91733 8.8 6.6V6.312C8.8 6.12 8.88533 5.96 9.056 5.832C9.22667 5.69333 9.45067 5.624 9.728 5.624C10.0267 5.624 10.2613 5.69867 10.432 5.848C10.6027 5.99733 10.688 6.216 10.688 6.504L10.672 8.136C10.6613 8.52 10.5813 8.81333 10.432 9.016C10.2827 9.208 10.0427 9.304 9.712 9.304C9.34933 9.304 9.08267 9.18667 8.912 8.952C8.53867 8.42933 8.16533 8.03467 7.792 7.768C7.41867 7.49067 6.928 7.352 6.32 7.352C5.712 7.352 5.13067 7.544 4.576 7.928C4.032 8.312 3.58933 8.83467 3.248 9.496C2.91733 10.1573 2.752 10.8827 2.752 11.672C2.752 12.408 2.91733 13.0533 3.248 13.608C3.57867 14.152 4.016 14.568 4.56 14.856C5.11467 15.144 5.712 15.288 6.352 15.288C6.84267 15.288 7.30667 15.1973 7.744 15.016C8.18133 14.8347 8.53333 14.5733 8.8 14.232C9.07733 13.88 9.216 13.464 9.216 12.984C9.216 12.7067 9.30133 12.4827 9.472 12.312C9.64267 12.1413 9.88267 12.056 10.192 12.056ZM14.4384 8.408C14.0544 8.408 13.7397 8.29067 13.4944 8.056C13.249 7.81067 13.1264 7.50133 13.1264 7.128C13.1264 6.75467 13.249 6.45067 13.4944 6.216C13.7397 5.97067 14.0597 5.848 14.4544 5.848C14.8277 5.848 15.137 5.97067 15.3824 6.216C15.6277 6.45067 15.7504 6.74933 15.7504 7.112C15.7504 7.48533 15.6277 7.79467 15.3824 8.04C15.137 8.28533 14.8224 8.408 14.4384 8.408ZM14.1984 16.904C13.9104 16.904 13.6704 16.8347 13.4784 16.696C13.297 16.5467 13.2117 16.3493 13.2224 16.104L13.3504 9.896C13.361 9.64 13.457 9.44267 13.6384 9.304C13.8197 9.16533 14.0544 9.096 14.3424 9.096C14.641 9.096 14.881 9.17067 15.0624 9.32C15.2544 9.45867 15.345 9.66133 15.3344 9.928L15.2064 16.104C15.1957 16.3493 15.0944 16.5467 14.9024 16.696C14.721 16.8347 14.4864 16.904 14.1984 16.904ZM22.2808 8.84C23.1981 8.84 23.9074 9.16533 24.4088 9.816C24.9101 10.456 25.1608 11.416 25.1608 12.696L25.1448 16.36C25.1448 16.5733 25.0541 16.7333 24.8728 16.84C24.6914 16.9467 24.4621 17 24.1848 17C23.9074 17 23.6728 16.952 23.4808 16.856C23.2888 16.76 23.1928 16.616 23.1928 16.424V12.68C23.1928 11.8587 23.1021 11.272 22.9208 10.92C22.7394 10.5573 22.4354 10.376 22.0088 10.376C21.6034 10.376 21.2781 10.5467 21.0328 10.888C20.7874 11.2187 20.5954 11.768 20.4568 12.536C20.3821 13.0053 20.3448 13.5387 20.3448 14.136L20.3608 16.296C20.3608 16.5307 20.2701 16.712 20.0888 16.84C19.9181 16.9573 19.6834 17.016 19.3848 17.016C19.0861 17.016 18.8461 16.952 18.6648 16.824C18.4941 16.696 18.4088 16.52 18.4088 16.296C18.4088 14.504 18.3714 12.7333 18.2968 10.984C18.2968 10.8133 18.2701 10.664 18.2168 10.536C18.1634 10.408 18.0994 10.2907 18.0247 10.184C17.9608 10.0773 17.9181 10.0027 17.8968 9.96C17.8328 9.87467 17.8008 9.77333 17.8008 9.656C17.8008 9.464 17.9128 9.28267 18.1368 9.112C18.3714 8.94133 18.5901 8.856 18.7928 8.856C18.8994 8.856 19.0008 8.888 19.0968 8.952C19.1928 9.016 19.2994 9.128 19.4168 9.288C19.6728 9.62933 19.8008 9.94933 19.8008 10.248V10.376C19.9928 9.93867 20.2861 9.576 20.6808 9.288C21.0861 8.98933 21.6194 8.84 22.2808 8.84ZM31.1509 17.128C30.2122 17.128 29.4122 16.9467 28.7509 16.584C28.1002 16.2107 27.6095 15.7093 27.2789 15.08C26.9482 14.44 26.7829 13.7253 26.7829 12.936C26.7829 12.1467 26.9642 11.4373 27.3269 10.808C27.7002 10.168 28.2069 9.672 28.8469 9.32C29.4975 8.95733 30.2282 8.776 31.0389 8.776C31.7749 8.776 32.4362 8.92 33.0229 9.208C33.6095 9.496 34.0735 9.90667 34.4149 10.44C34.7562 10.9733 34.9269 11.592 34.9269 12.296C34.9269 12.712 34.8575 13.0107 34.7189 13.192C34.5909 13.3627 34.3455 13.448 33.9829 13.448L28.4949 13.496C28.4949 13.7947 28.5962 14.104 28.7989 14.424C29.0015 14.744 29.3002 15.016 29.6949 15.24C30.0895 15.4533 30.5535 15.56 31.0869 15.56C31.4495 15.56 31.7535 15.5173 31.9989 15.432C32.2549 15.336 32.4629 15.224 32.6229 15.096C32.7829 14.968 32.9695 14.792 33.1829 14.568C33.3429 14.408 33.5189 14.328 33.7109 14.328C33.9135 14.328 34.1055 14.408 34.2869 14.568C34.4789 14.728 34.5749 14.9093 34.5749 15.112C34.5749 15.2613 34.5162 15.4267 34.3989 15.608C34.1429 15.992 33.7535 16.344 33.2309 16.664C32.7189 16.9733 32.0255 17.128 31.1509 17.128ZM33.1189 12.168C33.2042 12.168 33.2575 12.152 33.2789 12.12C33.3109 12.088 33.3269 12.0293 33.3269 11.944C33.3269 11.4533 33.1082 11.048 32.6709 10.728C32.2335 10.408 31.6895 10.248 31.0389 10.248C30.5375 10.248 30.0895 10.36 29.6949 10.584C29.3109 10.7973 29.0122 11.064 28.7989 11.384C28.5962 11.6933 28.4949 11.9707 28.4949 12.216L33.1189 12.168ZM41.0791 8.792C41.8365 8.792 42.5138 8.95733 43.1111 9.288C43.7085 9.61867 44.1778 10.0987 44.5191 10.728C44.8605 11.3467 45.0311 12.0827 45.0311 12.936C45.0311 13.7893 44.8605 14.5253 44.5191 15.144C44.1885 15.7627 43.7191 16.2373 43.1111 16.568C42.5138 16.8987 41.8205 17.064 41.0311 17.064C40.5298 17.064 40.0551 17.0053 39.6071 16.888C39.1698 16.76 38.8445 16.632 38.6311 16.504L38.5671 19.832C38.5671 20.056 38.4711 20.2373 38.2791 20.376C38.0978 20.5147 37.8631 20.584 37.5751 20.584C37.2658 20.584 37.0258 20.5093 36.8551 20.36C36.6845 20.2107 36.6098 20.008 36.6311 19.752C36.6845 18.8453 36.7165 17.6133 36.7271 16.056L36.7431 14.776C36.7645 13.5387 36.7751 12.4453 36.7751 11.496C36.7751 11.208 36.7431 10.9787 36.6791 10.808C36.6258 10.6373 36.5405 10.4827 36.4231 10.344C36.3378 10.248 36.2791 10.1733 36.2471 10.12C36.2151 10.0667 36.1991 9.99733 36.1991 9.912C36.1991 9.69867 36.3165 9.496 36.5511 9.304C36.7858 9.10133 37.0205 9 37.2551 9C37.3831 9 37.5165 9.048 37.6551 9.144C37.7511 9.21867 37.8525 9.336 37.9591 9.496C38.0765 9.656 38.1831 9.82667 38.2791 10.008C38.5351 9.66667 38.8978 9.37867 39.3671 9.144C39.8365 8.90933 40.4071 8.792 41.0791 8.792ZM40.8391 15.528C41.5218 15.528 42.0658 15.2987 42.4711 14.84C42.8765 14.3813 43.0791 13.7307 43.0791 12.888C43.0791 12.0667 42.8871 11.4427 42.5031 11.016C42.1191 10.5787 41.6018 10.36 40.9511 10.36C40.5245 10.36 40.1405 10.4507 39.7991 10.632C39.4685 10.8133 39.2071 11.032 39.0151 11.288C38.8338 11.5333 38.7431 11.752 38.7431 11.944L38.7111 14.84C38.7538 14.9253 38.8871 15.0213 39.1111 15.128C39.3351 15.2347 39.6018 15.3307 39.9111 15.416C40.2311 15.4907 40.5405 15.528 40.8391 15.528ZM54.2788 15.464C54.4601 15.496 54.5988 15.5653 54.6948 15.672C54.8014 15.768 54.8548 15.944 54.8548 16.2C54.8548 16.424 54.7961 16.6107 54.6788 16.76C54.5614 16.9093 54.4068 16.984 54.2148 16.984C53.7561 16.984 53.4094 16.9253 53.1748 16.808C52.9401 16.6907 52.7321 16.472 52.5508 16.152C52.1028 16.824 51.2921 17.16 50.1188 17.16C48.8921 17.16 47.9748 16.8027 47.3668 16.088C46.7588 15.3627 46.4548 14.4133 46.4548 13.24C46.4548 12.4613 46.6094 11.7573 46.9188 11.128C47.2388 10.4987 47.6921 10.0027 48.2788 9.64C48.8654 9.27733 49.5428 9.096 50.3108 9.096C50.7481 9.096 51.1428 9.18667 51.4948 9.368C51.8468 9.53867 52.1134 9.768 52.2948 10.056L52.3428 9.72C52.3534 9.57067 52.4228 9.44267 52.5508 9.336C52.6788 9.22933 52.8814 9.176 53.1588 9.176C53.4788 9.176 53.7081 9.25067 53.8468 9.4C53.9961 9.54933 54.0548 9.736 54.0228 9.96C53.9588 10.3013 53.8894 10.904 53.8148 11.768C53.7828 12.1947 53.7668 12.744 53.7668 13.416V14.168C53.7668 14.616 53.7934 14.9413 53.8468 15.144C53.9001 15.336 54.0441 15.4427 54.2788 15.464ZM51.8788 14.152C51.8894 13.6933 51.8948 13.0267 51.8948 12.152C51.8948 11.6613 51.7348 11.2827 51.4148 11.016C51.1054 10.7493 50.7481 10.616 50.3428 10.616C49.7561 10.616 49.2868 10.872 48.9348 11.384C48.5828 11.896 48.4068 12.5093 48.4068 13.224C48.4068 13.9173 48.5614 14.4933 48.8708 14.952C49.1801 15.4107 49.6334 15.64 50.2308 15.64C50.7214 15.64 51.1161 15.512 51.4148 15.256C51.7134 15 51.8681 14.632 51.8788 14.152ZM57.6898 16.856C57.4018 16.856 57.1671 16.7813 56.9858 16.632C56.8151 16.472 56.7298 16.2693 56.7298 16.024L56.6338 5.176C56.6338 4.92 56.7244 4.71733 56.9058 4.568C57.0978 4.408 57.3431 4.328 57.6418 4.328C57.9298 4.328 58.1591 4.40267 58.3298 4.552C58.5111 4.70133 58.6018 4.904 58.6018 5.16L58.6818 16.024C58.6818 16.28 58.5858 16.4827 58.3938 16.632C58.2018 16.7813 57.9671 16.856 57.6898 16.856Z" fill="#FF2E2E"/>
                </svg>
            </div>
            <button class="btn-subscribe">Subscribe to updates</button>
        </header>

        <div class="status-banner">
            <div class="status-title">
                <div class="status-dot"></div>
                <span>${statusText}</span>
            </div>
            <p class="status-desc">${statusDescription}</p>
        </div>

        <div class="system-status">
            <div class="section-header">
                <span class="section-title">System status</span>
                <span class="time-range">${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div class="component-list">
                <div class="component-item">
                    <div class="component-info">
                        <span class="component-name">
                            <svg class="checkmark" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                            Production API
                        </span>
                        <span class="component-sub">Global endpoints and services</span>
                    </div>
                    <span class="uptime-percent">99.98% uptime</span>
                </div>
                <div class="component-item">
                    <div class="component-info">
                        <span class="component-name">
                            <svg class="checkmark" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                            Database Cluster
                        </span>
                        <span class="component-sub">Primary MongoDB instance</span>
                    </div>
                    <span class="uptime-percent">100% uptime</span>
                </div>
                <div class="component-item">
                    <div class="component-info">
                        <span class="component-name">
                            <svg class="checkmark" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                            Content Delivery (CDN)
                        </span>
                        <span class="component-sub">Asset and media distribution</span>
                    </div>
                    <span class="uptime-percent">99.99% uptime</span>
                </div>
            </div>
        </div>

        <button class="history-btn">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
            View history
        </button>

        <footer>
            <p>&copy; ${new Date().getFullYear()} CinePal. All rights reserved.</p>
            <p style="margin-top: 0.5rem; font-size: 0.75rem;">Status page powered by CinePal Core Engine</p>
        </footer>
    </div>
</body>
</html>
  `;
};

module.exports = { getStatusPage };
