from datetime import date


def calculate_age(dob: date, today: date = None) -> str:
    """
    Calculate human-friendly age from date of birth.
    Examples:
    - 7 years
    - 7 years, 3 months
    - 1 year
    - 9 months
    """
    if today is None:
        today = date.today()

    if dob > today:
        return "Newborn"

    years = today.year - dob.year
    months = today.month - dob.month
    days = today.day - dob.day

    if days < 0:
        months -= 1

    if months < 0:
        years -= 1
        months += 12

    if years == 0:
        if months == 0:
            return "Newborn"
        return f"{months} month" if months == 1 else f"{months} months"

    year_str = f"{years} year" if years == 1 else f"{years} years"
    if months > 0:
        month_str = f"{months} month" if months == 1 else f"{months} months"
        return f"{year_str}, {month_str}"
    
    return year_str


def get_date_window(period: str = "7d", today: date = None):
    """
    Returns (start_date, end_date, prev_start_date, prev_end_date) for period filtering.
    Periods supported: '7d', '14d', '30d', 'all'
    """
    from datetime import timedelta
    if today is None:
        today = date.today()

    end_date = today

    if period == "14d":
        start_date = today - timedelta(days=13)
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date = prev_end_date - timedelta(days=13)
    elif period == "30d":
        start_date = today - timedelta(days=29)
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date = prev_end_date - timedelta(days=29)
    elif period == "all":
        start_date = None
        prev_start_date = None
        prev_end_date = None
    else:  # default '7d'
        start_date = today - timedelta(days=6)
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date = prev_end_date - timedelta(days=6)

    return start_date, end_date, prev_start_date, prev_end_date

