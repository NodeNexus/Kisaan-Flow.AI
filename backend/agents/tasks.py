from crewai import Task
from backend.agents.core_agents import WorkflowAgents

class WorkflowTasks:
    def __init__(self, prompt: str = "", step_callback=None):
        self.agents = WorkflowAgents(prompt)
        self.step_callback = step_callback

    def soil_weather_analysis_task(self, prompt: str) -> Task:
        return Task(
            description=f"Analyze the following farmer's details: '{prompt}'. Evaluate soil type, expected weather, and recommend suitable, high-yield crops and sustainable farming practices.",
            expected_output="A detailed agronomy report recommending specific crops, fertilizers, and watering schedules.",
            agent=self.agents.agronomist_agent(self.step_callback)
        )

    def market_viability_task(self) -> Task:
        return Task(
            description="Based on the agronomist's crop recommendations, research current local mandi prices and demand trends to determine the most profitable option.",
            expected_output="An economic viability report detailing expected costs, market prices, and projected profit margins.",
            agent=self.agents.economist_agent(self.step_callback)
        )

    def subsidy_identification_task(self) -> Task:
        return Task(
            description="Identify any government subsidies, PM-Kisan benefits, or crop insurance schemes applicable to the chosen crops and farmer's profile.",
            expected_output="A list of applicable government schemes with eligibility criteria and steps to apply.",
            agent=self.agents.policy_advisor_agent(self.step_callback)
        )

    def logistics_planning_task(self) -> Task:
        return Task(
            description="Create a supply chain plan for the recommended crops. Detail storage requirements and strategies to sell directly to buyers or the best local mandis.",
            expected_output="A logistics and supply chain plan to minimize post-harvest losses and maximize selling price.",
            agent=self.agents.supply_chain_agent(self.step_callback)
        )

    def final_advisory_synthesis_task(self, language: str = "English") -> Task:
        return Task(
            description=f"Synthesize the agronomy, economic, policy, and logistics reports into a simple, actionable, step-by-step guide for the farmer. You MUST write the final output entirely in {language}.",
            expected_output=f"A complete 'Kisan Advisory Guide' written in {language}, breaking down exactly what the farmer needs to do from sowing to selling.",
            agent=self.agents.krishi_mitra_agent(self.step_callback)
        )
