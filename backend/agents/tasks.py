from crewai import Task
from backend.agents.core_agents import WorkflowAgents

class WorkflowTasks:
    def __init__(self, prompt: str = "", step_callback=None):
        self.agents = WorkflowAgents(prompt)
        self.step_callback = step_callback

    def strategy_planning_task(self, prompt: str) -> Task:
        return Task(
            description=f"Analyze the following business prompt and create a comprehensive strategic roadmap. Prompt: '{prompt}'",
            expected_output="A structured strategic roadmap detailing the core business model, target audience, and high-level milestones.",
            agent=self.agents.ceo_agent(self.step_callback)
        )

    def market_research_task(self) -> Task:
        return Task(
            description="Conduct market research based on the CEO's strategic roadmap. Identify 3 main competitors, their weaknesses, and exactly who the target demographic is.",
            expected_output="A detailed market research report containing competitor analysis, target demographics, and actionable market entry strategies.",
            agent=self.agents.research_agent(self.step_callback)
        )

    def product_definition_task(self) -> Task:
        return Task(
            description="Using the strategic roadmap and market research, define the MVP (Minimum Viable Product). Outline the core features, user flows, and prioritize technical requirements.",
            expected_output="A Product Requirements Document (PRD) detailing MVP features, user stories, and technical requirements.",
            agent=self.agents.product_manager_agent(self.step_callback)
        )

