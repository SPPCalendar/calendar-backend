
export const validateEventInput = ({
  event_name,
  start_time,
  end_time,
  calendar_id,
}: {
  event_name?: string
  start_time?: string
  end_time?: string
  calendar_id?: number
}) => {
  if (!event_name || !start_time || !end_time || !calendar_id) {
    return 'Missing required fields'
  }

  const startDate = new Date(start_time)
  const endDate = new Date(end_time)

  if (endDate <= startDate) {
    return 'end_time must be later than start_time'
  }

  return null
}