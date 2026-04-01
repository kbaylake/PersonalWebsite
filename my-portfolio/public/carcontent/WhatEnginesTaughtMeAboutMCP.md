# From K24 to LLMs: What Engine Architecture Taught Me About Building AI Systems with MCP

*By Karan Bedi — AI Engineer | Computer Vision · LLM Fine-tuning · Agentic Systems*

---

An engine is a series of controlled explosions.

That sounds violent. And it is. But when you stand next to a well-tuned engine at idle — really listen to it — it's almost impossible to believe how much raw chaos is being orchestrated so precisely, so quietly, beneath the hood. Hundreds of combustion events per minute. Thousands of moving parts. Every one of them timed, balanced, and managed in real time.

I've spent a lot of time underneath my 2012 Honda Accord's K24. Doing a full day-0 restoration — engine mounts, transmission fluid, VTEC solenoid, suspension — forces you to understand the system, not just the parts. And the deeper I got into the mechanical architecture, the more I kept seeing the same engineering principles surface in the AI systems I build professionally.

This isn't a metaphor for fun. It's a genuine structural parallel. And understanding it changed how I design AI pipelines.

---

## The rotating assembly: synchronization is everything

Start with the rotating assembly — the crankshaft and camshaft.

The crankshaft converts linear combustion force into rotational motion. Every piston fires in sequence, and the crank translates that into the smooth rotation that eventually drives your wheels. The camshaft sits above, controlling exactly when the intake and exhaust valves open — letting air and fuel in, letting burnt gases out.

These two shafts must be synchronized to within a single degree. A timing chain or belt maintains that relationship mechanically. If it slips — even slightly — the engine loses power, runs rough, or destroys itself. The relationship between crank and cam isn't optional. It's the contract the entire system is built on.

This is what **MCP — Model Context Protocol** — does for AI agents.

MCP is the orchestration layer. It's the timing chain of an agentic AI system. It doesn't generate intelligence. It doesn't reason. What it does is define the contract between the model and its tools: when does each tool fire, in what sequence, with what inputs, and how does the output flow back into the next decision?

Without that synchronization, you have a language model and a set of capable tools sitting next to each other — unconnected, untimed, firing out of sequence. With MCP, you have a system. One that breathes.

Every production AI system I've built taught me the same lesson the K24 did: the components are rarely the bottleneck. The orchestration is.

---

## VTEC: context-aware mode switching

Honda's VTEC system is genuinely elegant engineering.

At low RPM, VTEC runs a conservative cam profile — short valve lift, narrow timing window. Efficient. Smooth. Appropriate for light load. Cross a threshold — typically around 5,500 RPM — and an oil pressure-actuated solenoid engages a third cam lobe. The engine shifts into a high-performance profile: longer valve lift, wider timing window, more aggressive breathing. Same physical engine. Completely different behaviour. Triggered by context.

The engineering insight is that no single cam profile is optimal across all operating conditions. You need a system that knows when to switch modes.

This is precisely how **Retrieval-Augmented Generation (RAG)** works — and why I designed my Agentic RAG pipeline the way I did.

A naive language model always runs at full capacity: generating from parametric memory regardless of whether the query demands it. A well-designed RAG system is smarter. For low-stakes queries, it answers from base knowledge — fast, cheap, sufficient. When the query crosses a complexity or precision threshold — when hallucination risk is high, when the topic demands current data, when the answer needs to be verifiably grounded — the system kicks into retrieval mode. It runs a similarity search against a vector store, pulls relevant chunks, grounds the generation in real retrieved context, and produces output anchored to actual data.

VTEC switches with oil pressure and a solenoid.
RAG switches with an embedding similarity score and a retrieval call.

The principle is the same: threshold-aware, context-driven mode switching. Static systems fail because they apply the same operating profile to every situation. Intelligent systems — mechanical or software — know when to shift.

When I built the Agentic RAG pipeline using LangChain and ChromaDB, the hardest architectural decision wasn't the retrieval mechanism. It was deciding *when* to retrieve — setting the threshold that triggers the switch from generation to retrieval. Too low, and you retrieve constantly, slowing the system and drowning the model in irrelevant context. Too high, and you miss the moments that actually need grounding.

That's a VTEC cam profile decision. Same problem, different domain.

---

## ATF degradation: how fine-tuning fails silently

The Accord's K24 is mated to a 5-speed automatic transmission. The ATF — Automatic Transmission Fluid — is what makes it work.

ATF isn't just lubricant. It's a hydraulic medium. The torque converter, the clutch packs, the valve body — all operated by fluid pressure, all dependent on ATF maintaining its viscosity, its friction coefficient, its thermal stability. Fresh ATF is clean, red, precisely formulated. But it degrades. It absorbs heat, picks up metal particles from normal clutch wear, breaks down chemically over time.

The problem is that it doesn't fail suddenly. It fails slowly.

Shifts get marginally softer. The torque converter lockup gets slightly sluggish. Nothing that screams "service me" — just a subtle, cumulative decline. By the time you notice the shifts are rough or the gearbox is slipping, the degradation has been compounding for a long time. The fluid that looked fine six months ago has been quietly undermining the system ever since.

**Fine-tuning a large language model has the exact same failure mode.**

When I fine-tuned a quantized Llama model on LinkedIn post data — running LoRA fine-tuning on an RTX 4060 Ti — data quality was the unglamorous centrepiece of the entire process. Because LLM fine-tuning degradation is invisible until it isn't.

Train on a dirty corpus and the model doesn't collapse immediately. It drifts. Subtly wrong. Confidently wrong. It learns the noise as signal. It picks up stylistic inconsistencies, factual errors, structural artifacts from bad tokenization — and it generalises them. By the time you're evaluating outputs and noticing something is off, the compounding has been running for the entire training cycle.

Clean fluid on day zero, every time. Clean data before you touch a training script, every time.

This is why data curation isn't the boring part of an ML project. It's the transmission fluid. Neglect it and everything downstream suffers in ways that are hard to diagnose and expensive to fix.

---

## Engine mounts: isolating signal from noise

Engine mounts don't make the engine faster. They don't improve fuel economy. They don't add power.

What they do is isolate the chassis from vibration. The engine produces rotational and combustion forces that, left unchecked, would transmit through the entire car — into the subframe, the steering, the firewall. Worn mounts don't reduce engine output. They let vibration bleed into everything downstream, degrading ride quality, adding NVH (noise, vibration, harshness), and — over time — stressing components that weren't designed to absorb those loads.

My day-0 restoration included replacing all engine mounts with Technix and RBI units. The difference wasn't more power. It was a cleaner, more refined delivery of the power that already existed.

In an AI pipeline, your **chunking strategy, embedding model, and retrieval logic are your engine mounts**.

They don't add intelligence. The LLM already has the capability. What they do is determine whether that capability receives clean input or noisy input. A bad chunking strategy — chunks too large, too small, split across logical boundaries — means your retrieval pulls incoherent fragments. A weak embedding model means semantically relevant documents score low and irrelevant ones score high. Poor retrieval logic means the context window fills with noise before the signal even arrives.

The model then generates confidently from garbage. Not because the model is bad — because the isolation layer failed.

Garbage in, eloquently delivered garbage out. That's a mount problem, not an engine problem.

When I evaluate an AI pipeline that's producing poor outputs, this is where I start: not the model, not the prompt — the mounts. What's the chunk size? What's the embedding model? What does the retrieval actually return for a representative query? Fix the isolation layer first.

---

## The ECU: where it all comes together

We've talked about the rotating assembly, the mode-switching solenoid, the fluid, the mounts. But none of it happens without the ECU — the Engine Control Unit.

The ECU is the brain. It reads crank position sensor data to know exactly where each piston is in its cycle. It reads the camshaft position sensor to track valve timing relative to the crank. It reads the mass airflow sensor, the oxygen sensors, the throttle position sensor, the coolant temperature sensor. It processes all of this — thousands of times per second — and makes real-time decisions: when to fire each injector, how long to hold it open, when to trigger each ignition coil, whether to engage the VTEC solenoid, how to adjust fuel trim based on O2 sensor feedback.

The ECU doesn't do any one thing perfectly. It balances everything simultaneously — performance, efficiency, emissions — in real time, under changing conditions, with imperfect sensor data.

A K24 without its ECU is just metal. Capable metal. But inert.

**MCP is the ECU of an AI agent system.**

It reads context — what the user asked, what tool was called last, what the tool returned, what state the conversation is in. It routes: which tool fires next, with what inputs. It manages the feedback loop: the output of one tool becomes the input context for the next decision. It closes the loop between model reasoning and real-world action.

An LLM without MCP orchestration is a K24 with no ECU. The combustion is there. The rotating assembly is there. The VTEC hardware is there. But without the timing, the routing, the sensor integration, the feedback loop — it just sits there, producing heat and noise.

What makes modern engines remarkable isn't the explosions. It's the precision with which ten thousand variables are managed simultaneously to turn those explosions into controlled, purposeful motion.

What makes modern AI systems powerful isn't the model. It's the architecture that turns model capability into reliable, purposeful output.

---

## The thing people keep getting wrong

Everyone is sprinkling "AI" into products, job titles, and pitch decks like it's a seasoning.

It's not.

AI is a component. A powerful one — like a high-compression K24 is a powerful component. But a K24 sitting on a workshop floor doesn't go anywhere. It needs a transmission, a drivetrain, a chassis, a suspension, fuel delivery, an ECU, a cooling system. Every one of those systems has to be designed, integrated, and tuned to work together. Then — and only then — does the power become useful.

The engineers who built the Type R didn't win because they found a stronger engine. They won because they understood the entire system. They knew what the engine needed to perform. They built the drivetrain to use it, the suspension to handle it, the chassis to carry it. They made it a car, not a collection of impressive parts.

Building AI systems is identical.

You can have access to every frontier model, every vector database, every orchestration framework available today. Without purpose, architecture, and the engineering discipline to tie it together — you have noise. Impressive, expensive noise.

MCP, RAG, fine-tuning, quantization — these aren't magic words. They're engineering tools. Like a solenoid, a torque converter, a mount. Their value is entirely determined by how well they're integrated into a system that has a clear job to do.

The goal isn't to use AI. The goal is to build something that works.

---

## What I'm building toward

I'm Karan Bedi — final-year B.Tech AI student at NMIMS Mumbai, graduating 2026. Currently at Samsung India as a Senior Assistant Engineer, building computer vision pipelines for defect detection on manufacturing lines. Outside of Samsung, I've shipped an Agentic RAG pipeline, fine-tuned Llama on domain data, and built a geospatial fleet anomaly detection system.

The K24 in the driveway and the models running on my RTX 4060 Ti are, to me, the same problem: complex systems that reward deep understanding, careful architecture, and the discipline to get the fundamentals right before chasing the headline numbers.

I'm actively looking for Mumbai-based roles in AI/ML Engineering, Data Science, and Software Engineering — L1/L2 positions where the engineering is taken seriously and there's real work to be done.

If the way I think about systems resonates with how your team builds — I'd like to talk.

[Connect on LinkedIn](https://www.linkedin.com/in/karan-bedi-9414a9241/) · [kbedi03@gmail.com](mailto:kbedi03@gmail.com)

---

*Karan Bedi — AI Engineer × Automotive Architect · Mumbai · 2026*