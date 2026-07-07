from crewai import Agent, LLM
from langchain_community.tools import DuckDuckGoSearchRun
from backend.core.config import settings

# Initialize the Fireworks LLM wrapper
def get_fireworks_llm(model_name: str = settings.DEFAULT_MODEL) -> LLM:
    return LLM(
        model=f"fireworks/{model_name}",
        api_key=settings.FIREWORKS_API_KEY,
    )

def route_model(prompt: str) -> str:
    """Intelligent Router: Selects the appropriate model based on prompt complexity."""
    if "complex" in prompt.lower() or "strategy" in prompt.lower() or len(prompt) > 200:
        return settings.DEFAULT_MODEL # Deep reasoning (70B)
    return settings.FAST_MODEL # Fast reasoning (8B)

class WorkflowAgents:
    def __init__(self, prompt: str = ""):
        # Dynamically route the CEO model based on the initial prompt
        self.ceo_model = route_model(prompt)
        self.default_llm = get_fireworks_llm(self.ceo_model)
        self.fast_llm = get_fireworks_llm(settings.FAST_MODEL)
        self.search_tool = DuckDuckGoSearchRun()

    def ceo_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Chief Executive Officer",
            goal="Analyze the user request, break it down into a strategic roadmap, and coordinate execution.",
            backstory="You are an experienced startup CEO. You excel at turning vague ideas into concrete business plans and managing specialized teams to deliver results.",
            verbose=True,
            allow_delegation=True,
            llm=self.default_llm,
            step_callback=step_callback
        )

    def research_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Market Research Analyst",
            goal="Conduct thorough market research, competitor analysis, and identify target demographics.",
            backstory="You are a data-driven researcher who finds market gaps, analyzes competitor weaknesses, and provides actionable insights for product development.",
            verbose=True,
            allow_delegation=False,
            tools=[self.search_tool],
            llm=self.fast_llm,
            step_callback=step_callback
        )

    def product_manager_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Product Manager",
            goal="Create product roadmaps, define features, and ensure the product aligns with user needs and market research.",
            backstory="You are a seasoned PM who knows how to prioritize features, mitigate risks, and define exact milestones for the engineering and marketing teams.",
            verbose=True,
            allow_delegation=False,
            llm=self.default_llm,
            step_callback=step_callback
        )

    def developer_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Lead Software Engineer",
            goal="Design technical architecture and write foundational code based on PM requirements.",
            backstory="You are an elite developer with expertise in scalable systems, AI integration, and modern tech stacks.",
            verbose=True,
            allow_delegation=False,
            llm=self.default_llm,
            step_callback=step_callback
        )

