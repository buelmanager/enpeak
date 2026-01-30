// 모든 카테고리 및 시나리오 정의
const ALL_SCENARIOS: Record<string, string[]> = {
  daily: ['morning_routine', 'grocery_shopping', 'neighbor_chat', 'weather_talk', 'weekend_plans', 'house_chores', 'pet_care', 'home_repair'],
  restaurant: ['cafe_order', 'restaurant_reservation', 'ordering_food', 'asking_recommendation', 'food_allergy', 'complaint', 'paying_bill', 'takeout_delivery', 'food_review', 'cooking_recipe'],
  travel: ['airport_checkin', 'immigration', 'hotel_checkin', 'hotel_request', 'asking_directions', 'public_transport', 'taxi_ride', 'car_rental', 'tourist_info', 'tour_booking', 'lost_luggage', 'travel_emergency'],
  shopping: ['clothing_store', 'trying_on', 'asking_size', 'electronics_store', 'return_exchange', 'bargaining', 'gift_shopping', 'online_shopping'],
  work: ['job_interview', 'self_introduction', 'meeting_intro', 'presentation', 'phone_call', 'email_discussion', 'negotiation', 'networking', 'asking_help', 'giving_feedback', 'deadline_extension', 'resignation'],
  health: ['doctor_appointment', 'describing_symptoms', 'pharmacy', 'emergency_room', 'dentist', 'eye_exam', 'health_insurance', 'mental_health'],
  social: ['making_friends', 'party_invitation', 'catching_up', 'giving_compliments', 'apology', 'consoling', 'giving_advice', 'declining_politely', 'sharing_news', 'discussing_hobbies'],
  entertainment: ['movie_tickets', 'movie_discussion', 'concert_tickets', 'museum_visit', 'sports_event', 'gym_membership', 'book_club', 'karaoke'],
  education: ['class_registration', 'asking_teacher', 'group_project', 'study_group', 'library', 'tutoring', 'academic_advice', 'graduation'],
  housing: ['apartment_hunting', 'viewing_apartment', 'lease_signing', 'moving_in', 'landlord_issues', 'utility_setup', 'roommate_talk', 'moving_out'],
  finance: ['opening_account', 'atm_help', 'currency_exchange', 'loan_inquiry', 'credit_card', 'investment'],
  services: ['haircut', 'dry_cleaning', 'post_office', 'car_service', 'tech_support', 'customer_service', 'spa_massage', 'photography'],
}

export function generateStaticParams() {
  const params: { categoryId: string; scenarioId: string }[] = []

  Object.entries(ALL_SCENARIOS).forEach(([categoryId, scenarios]) => {
    scenarios.forEach(scenarioId => {
      params.push({ categoryId, scenarioId })
    })
  })

  return params
}

export default function ScenarioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
