from crewai import Agent, LLM
from backend.tools.cached_search import CachedSearchTool
from backend.core.config import settings

# AMD HACKATHON INTEGRATION:
# We use Fireworks AI for our LLM backend because their infrastructure is powered by 
# AMD Instinct™ MI300X accelerators. This provides the massive parallelization and low-latency 
# inference required to run our 5-agent CrewAI workforce in real-time.
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
        self.ceo_model = route_model(prompt)
        self.default_llm = get_fireworks_llm(self.ceo_model)
        self.fast_llm = get_fireworks_llm(settings.FAST_MODEL)
        self.search_tool = CachedSearchTool()

    def agronomist_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Chief Agronomist",
            goal="Analyze the farmer's land, soil, and weather details to recommend the most profitable and sustainable crops.",
            backstory="You are an expert Indian agricultural scientist (कृषि विज्ञानी) with decades of experience in soil health, crop rotation, and climate-resilient farming.",
            verbose=True,
            allow_delegation=True,
            llm=self.default_llm,
            step_callback=step_callback
        )

    def economist_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Agricultural Economist",
            goal="Research current Mandi (market) prices, demand trends, and determine the economic viability of the proposed crops.",
            backstory="You are a data-driven agricultural economist (कृषि अर्थशास्त्री) who analyzes market trends across India to maximize farmer profits and minimize financial risk.",
            verbose=True,
            allow_delegation=False,
            tools=[self.search_tool],
            llm=self.fast_llm,
            step_callback=step_callback
        )

    def policy_advisor_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Government Policy Advisor",
            goal="Identify suitable government subsidies, PM-Kisan schemes, and crop insurance policies for the farmer.",
            backstory="You are an expert on Indian agricultural policies and schemes (योजना सलाहकार) who helps farmers navigate bureaucracy to get financial support.",
            verbose=True,
            allow_delegation=False,
            tools=[self.search_tool],
            llm=self.fast_llm,
            step_callback=step_callback
        )

    def supply_chain_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Supply Chain Coordinator",
            goal="Plan logistics, storage, and direct-to-buyer selling strategies.",
            backstory="You are a logistics expert (आपूर्ति श्रृंखला विशेषज्ञ) focused on eliminating middlemen and ensuring the farmer's harvest reaches the market fresh and profitably.",
            verbose=True,
            allow_delegation=False,
            llm=self.default_llm,
            step_callback=step_callback
        )

    def krishi_mitra_agent(self, step_callback=None) -> Agent:
        return Agent(
            role="Krishi Mitra (Extension Worker)",
            goal="Synthesize all reports into a simple, actionable, step-by-step advisory guide for the farmer.",
            backstory="You are a trusted local community worker (कृषि मित्र) who translates complex agricultural and economic data into simple, actionable advice for Indian farmers.",
            verbose=True,
            allow_delegation=False,
            llm=self.default_llm,
            step_callback=step_callback
        )
