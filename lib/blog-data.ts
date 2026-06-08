import { prisma } from "./db";

function cleanPrismaError(error: any): string {
  if (!(error instanceof Error)) return String(error);
  
  const lines = error.message.split("\n")
    .map(line => line.trim())
    .filter(line => {
      if (line.length === 0) return false;
      if (line.includes("invocation")) return false;
      if (line.includes("db.ts")) return false;
      if (line.includes("blog-data.ts")) return false;
      if (line.includes("route.ts")) return false;
      if (line.startsWith("at ")) return false;
      if (/^\d+/.test(line)) return false;
      if (line.includes("→")) return false;
      if (line.includes("/home/")) return false;
      return true;
    });
  
  if (lines.length > 0) {
    return lines[0];
  }
  return error.message.trim().split("\n")[0];
}

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  snippet: string;
  content: string;
}


export const blogPosts: BlogPost[] = [
  {
    slug: "writing-a-monkey-compiler-in-go",
    title: "Writing a Monkey Compiler in Go: Stack-Based Virtual Machines",
    date: "May 12, 2026",
    readTime: "8 min read",
    category: "Systems",
    snippet:
      "An exploration into compiler architecture, converting an AST into bytecode instructions, and executing them inside a custom virtual machine in Go.",
    content: `
## Introduction

Writing a compiler from scratch is one of the most rewarding exercises a software engineer can undertake. In this article, I walk through my journey of building a complete compiler for the Monkey programming language, transforming abstract syntax trees into bytecode and executing them on a custom stack-based virtual machine.

## Why a Stack-Based VM?

Stack-based virtual machines are elegant in their simplicity. Unlike register-based VMs (like LuaJIT or Dalvik), a stack VM doesn't need to worry about register allocation. Every operation pushes to or pops from the operand stack, making the compiler significantly easier to implement while still achieving respectable performance.

\`\`\`go
type VM struct {
    constants    []object.Object
    instructions code.Instructions
    stack        []object.Object
    sp           int // stack pointer
}

func (vm *VM) Run() error {
    for ip := 0; ip < len(vm.instructions); ip++ {
        op := code.Opcode(vm.instructions[ip])
        switch op {
        case code.OpConstant:
            constIndex := code.ReadUint16(vm.instructions[ip+1:])
            ip += 2
            err := vm.push(vm.constants[constIndex])
            if err != nil {
                return err
            }
        case code.OpAdd:
            right := vm.pop()
            left := vm.pop()
            result := left.(int64) + right.(int64)
            vm.push(result)
        }
    }
    return nil
}
\`\`\`

## The Compilation Pipeline

The full pipeline from source code to execution follows these stages:

1. **Lexing** — Tokenizing raw source text into a stream of tokens
2. **Parsing** — Building an Abstract Syntax Tree (AST) from the token stream using a Pratt parser
3. **Compilation** — Walking the AST and emitting bytecode instructions
4. **Execution** — Running the bytecode on the stack-based VM

Each stage is cleanly separated, making the codebase modular and testable. The compiler itself is surprisingly concise — under 500 lines of Go code for the core compilation logic.

## Bytecode Design

Designing the bytecode instruction set required careful thought about what operations the Monkey language needs:

- **OpConstant** — Push a constant onto the stack
- **OpAdd, OpSub, OpMul, OpDiv** — Arithmetic operations
- **OpTrue, OpFalse** — Boolean literals
- **OpEqual, OpNotEqual, OpGreaterThan** — Comparison operators
- **OpJump, OpJumpNotTruthy** — Control flow
- **OpSetGlobal, OpGetGlobal** — Variable bindings
- **OpCall, OpReturn** — Function calls

## Lessons Learned

Building this compiler taught me that compilers are not magic — they are engineering. Every design choice involves tradeoffs between implementation complexity, performance, and language expressiveness. The most important lesson: start simple, get something working, then iterate.

## Conclusion

If you're interested in systems programming and want a deep understanding of how programming languages work under the hood, I highly recommend working through Thorsten Ball's "Writing A Compiler In Go." The hands-on approach of building everything from scratch gives you intuition that no amount of theory can replicate.
    `.trim(),
  },
  {
    slug: "monolithic-kernel-development-in-rust",
    title: "Monolithic Kernel Development in Rust: Memory Paging",
    date: "April 28, 2026",
    readTime: "12 min read",
    category: "Systems",
    snippet:
      "How memory management works under the hood when targeting x86_64 architecture in Rust, configuring custom page tables, and handling page faults.",
    content: `
## Introduction

Operating system kernel development is perhaps the most challenging domain in all of software engineering. In this article, I share my experience implementing memory paging for an x86_64 monolithic kernel written entirely in Rust — a language that brings memory safety guarantees to one of the most unsafe domains in computing.

## Why Rust for Kernel Development?

Traditional kernel development in C requires extreme discipline to avoid undefined behavior, use-after-free bugs, and buffer overflows. Rust's ownership model eliminates entire categories of memory bugs at compile time, while still providing the zero-cost abstractions and low-level control needed for kernel code.

\`\`\`rust
use x86_64::structures::paging::{
    PageTable, PhysFrame, Mapper, Size4KiB, FrameAllocator
};

pub unsafe fn init(level_4_table: &mut PageTable) -> OffsetPageTable<'static> {
    let phys_mem_offset = VirtAddr::new(PHYSICAL_MEMORY_OFFSET);
    OffsetPageTable::new(level_4_table, phys_mem_offset)
}
\`\`\`

## The x86_64 Paging Model

x86_64 uses a 4-level page table hierarchy:

- **Level 4 (PML4)** — 512 entries, each covering 512 GiB
- **Level 3 (PDPT)** — 512 entries, each covering 1 GiB
- **Level 2 (PD)** — 512 entries, each covering 2 MiB
- **Level 1 (PT)** — 512 entries, each covering 4 KiB pages

Each page table entry contains a physical frame address plus permission flags (present, writable, user-accessible, etc.). The CPU's Memory Management Unit (MMU) walks this hierarchy on every memory access, translating virtual addresses to physical ones.

## Frame Allocation

Before we can map virtual pages to physical memory, we need a frame allocator — a component that tracks which physical memory frames are available:

\`\`\`rust
pub struct BootInfoFrameAllocator {
    memory_map: &'static MemoryRegions,
    next: usize,
}

impl BootInfoFrameAllocator {
    pub unsafe fn init(memory_map: &'static MemoryRegions) -> Self {
        BootInfoFrameAllocator {
            memory_map,
            next: 0,
        }
    }

    fn usable_frames(&self) -> impl Iterator<Item = PhysFrame> {
        self.memory_map.iter()
            .filter(|r| r.kind == MemoryRegionKind::Usable)
            .flat_map(|r| {
                let start = r.start;
                let end = r.end;
                let frame_range = start..end;
                frame_range.step_by(4096)
            })
            .map(|addr| PhysFrame::containing_address(PhysAddr::new(addr)))
    }
}
\`\`\`

## Handling Page Faults

When the CPU encounters an unmapped virtual address, it triggers a page fault exception. Our kernel must handle this gracefully — either by lazily mapping the page or terminating the offending process:

The double fault handler acts as a safety net: if our page fault handler itself triggers a fault, the double fault handler ensures the kernel doesn't triple-fault and reboot the machine.

## Conclusion

Implementing memory paging from scratch gave me a profound appreciation for what modern operating systems do on every single memory access. Rust's safety guarantees make this work less terrifying, but the complexity of the x86_64 memory model remains humbling.
    `.trim(),
  },
  {
    slug: "accessible-keyboard-navigable-component-libraries",
    title: "Designing Accessible and Keyboard-Navigable Component Libraries",
    date: "March 15, 2026",
    readTime: "6 min read",
    category: "Frontend",
    snippet:
      "Deep dive into building primitives that support standard keyboard interactions, hotkeys, focus traps, and screen reader announcements.",
    content: `
## Introduction

Accessibility isn't a feature — it's a requirement. When building component libraries used by thousands of developers, getting keyboard navigation and screen reader support right from the start saves enormous effort downstream. This article shares patterns I've refined while building accessible UI primitives.

## The Foundation: Semantic HTML

Before reaching for ARIA attributes, exhaust what native HTML gives you for free:

\`\`\`tsx
// ❌ Avoid: div with click handler
<div onClick={handleClick}>Click me</div>

// ✅ Prefer: native button element
<button onClick={handleClick}>Click me</button>
\`\`\`

Native \`<button>\`, \`<a>\`, \`<input>\`, and \`<select>\` elements come with built-in keyboard support, focus management, and screen reader announcements. Custom divs require you to manually reimplement all of this.

## Focus Management

For complex components like modals, dropdowns, and command palettes, proper focus management is critical:

\`\`\`tsx
function Dialog({ isOpen, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      // Focus the dialog
      dialogRef.current?.focus();
    } else {
      // Restore focus when closing
      (previousFocusRef.current as HTMLElement)?.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <FocusTrap>{children}</FocusTrap>
    </div>
  );
}
\`\`\`

Key principles:
- **Trap focus** inside modal dialogs so Tab cycling stays within the modal
- **Restore focus** to the triggering element when the modal closes
- **Support Escape** to dismiss overlays

## Keyboard Navigation Patterns

Different component types require different keyboard patterns. The WAI-ARIA Authoring Practices guide defines these clearly:

| Component | Keys | Behavior |
|-----------|------|----------|
| Menu | Arrow Up/Down | Navigate items |
| Tabs | Arrow Left/Right | Switch tabs |
| Listbox | Arrow Up/Down | Select option |
| Dialog | Escape | Close dialog |
| Combobox | Arrow Down | Open listbox |

## Roving TabIndex

For composite components like toolbars and tab lists, use the roving tabindex pattern. Only one item in the group has \`tabIndex={0}\`; the rest have \`tabIndex={-1}\`:

\`\`\`tsx
function TabList({ tabs, activeTab, onTabChange }) {
  return (
    <div role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === index}
          tabIndex={activeTab === index ? 0 : -1}
          onClick={() => onTabChange(index)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              onTabChange((index + 1) % tabs.length);
            }
            if (e.key === 'ArrowLeft') {
              onTabChange((index - 1 + tabs.length) % tabs.length);
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
\`\`\`

## Live Regions for Dynamic Content

When content updates dynamically (toast notifications, loading states, form validation), screen readers need to be explicitly told:

\`\`\`tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
\`\`\`

- \`aria-live="polite"\` — Announce when the user is idle
- \`aria-live="assertive"\` — Interrupt and announce immediately
- \`aria-atomic="true"\` — Read the entire region, not just the changed part

## Conclusion

Building accessible components isn't about checking compliance boxes — it's about ensuring everyone can use what you build. Start with semantic HTML, layer ARIA attributes only when native semantics fall short, manage focus deliberately, and test with real screen readers. Your users will thank you.
    `.trim(),
  },
  {
    slug: "building-a-real-time-system-monitor-with-go-and-nextjs",
    title: "Building a Real-Time System Monitor with Go and Next.js",
    date: "February 20, 2026",
    readTime: "10 min read",
    category: "Full-Stack",
    snippet:
      "How I built a browser-based system monitoring tool that reads from Linux procfs and streams live metrics via WebSockets to a React dashboard.",
    content: `
## Introduction

System monitoring is typically the domain of CLI tools like htop, glances, or Prometheus exporters. But what if we could bring that same real-time visibility into a beautiful browser-based dashboard? In this article, I walk through building sys-mon — a real-time system monitoring tool with a Go backend reading Linux procfs and a Next.js frontend displaying live metrics via WebSockets.

## Architecture Overview

The system has three main components:

1. **Metrics Collector (Go)** — Reads CPU, memory, disk, and network stats from \`/proc\`
2. **WebSocket Server (Go)** — Streams metrics to connected clients at configurable intervals
3. **Dashboard (Next.js + React)** — Renders real-time charts and system information

## Reading from procfs

Linux exposes system metrics through the proc filesystem. Instead of using external libraries, we can read these files directly:

\`\`\`go
package metrics

import (
    "os"
    "strconv"
    "strings"
)

type CPUStats struct {
    User    float64 \`json:"user"\`
    System  float64 \`json:"system"\`
    Idle    float64 \`json:"idle"\`
    IOWait  float64 \`json:"iowait"\`
    Usage   float64 \`json:"usage"\`
}

func ReadCPUStats() (*CPUStats, error) {
    data, err := os.ReadFile("/proc/stat")
    if err != nil {
        return nil, err
    }

    lines := strings.Split(string(data), "\\n")
    fields := strings.Fields(lines[0]) // "cpu" aggregate line

    user, _ := strconv.ParseFloat(fields[1], 64)
    nice, _ := strconv.ParseFloat(fields[2], 64)
    system, _ := strconv.ParseFloat(fields[3], 64)
    idle, _ := strconv.ParseFloat(fields[4], 64)
    iowait, _ := strconv.ParseFloat(fields[5], 64)

    total := user + nice + system + idle + iowait
    usage := ((total - idle) / total) * 100

    return &CPUStats{
        User:   user / total * 100,
        System: system / total * 100,
        Idle:   idle / total * 100,
        IOWait: iowait / total * 100,
        Usage:  usage,
    }, nil
}
\`\`\`

## WebSocket Streaming

The Go backend uses gorilla/websocket to establish persistent connections and stream metrics at 1-second intervals:

\`\`\`go
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        cpu, _ := metrics.ReadCPUStats()
        mem, _ := metrics.ReadMemoryStats()

        payload := SystemMetrics{
            CPU:       cpu,
            Memory:    mem,
            Timestamp: time.Now().Unix(),
        }

        if err := conn.WriteJSON(payload); err != nil {
            break
        }
    }
}
\`\`\`

## The React Dashboard

On the frontend, we use a custom hook to manage the WebSocket connection and buffer the last 60 data points for charting:

The dashboard renders sparkline charts for CPU and memory usage, a process table showing top consumers, and network I/O rates — all updating in real-time without any page refreshes.

## Lessons Learned

Building this project reinforced several important principles. Direct procfs reads are incredibly fast, and the overhead of JSON serialization and WebSocket framing is negligible. WebSockets provide a clean, bidirectional communication channel that is perfect for streaming metrics. Finally, keeping the Go backend focused on data collection and the React frontend focused on visualization creates a clean separation of concerns.

## Conclusion

sys-mon demonstrates that systems programming and web development don't have to be separate worlds. By combining Go's efficiency in reading system internals with React's rendering capabilities, we get the best of both domains — deep system visibility wrapped in an intuitive, beautiful interface.
    `.trim(),
  },
  {
    slug: "zero-cost-abstractions-in-rust",
    title: "Zero-Cost Abstractions in Rust: Generics, Traits, and Monomorphization",
    date: "January 8, 2026",
    readTime: "7 min read",
    category: "Systems",
    snippet:
      "Understanding how Rust delivers high-level ergonomics without runtime overhead through compile-time monomorphization of generics and trait dispatch.",
    content: `
## Introduction

Rust promises "zero-cost abstractions" — the idea that you don't pay a performance penalty for using high-level language features. But how does this actually work? In this article, we explore the compilation strategies that make Rust's generics and traits as fast as hand-written specialized code.

## What Does "Zero-Cost" Mean?

Bjarne Stroustrup, the creator of C++, defined zero-cost abstractions with two rules:

1. **What you don't use, you don't pay for.**
2. **What you do use, you couldn't hand-code any better.**

Rust takes this principle seriously. When you write generic code with traits, the compiler generates specialized versions for each concrete type — a process called monomorphization.

## Monomorphization in Action

Consider a simple generic function:

\`\`\`rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in &list[1..] {
        if item > largest {
            largest = item;
        }
    }
    largest
}
\`\`\`

When you call \`largest(&vec![1, 2, 3])\` and \`largest(&vec![1.0, 2.0, 3.0])\`, the compiler generates two separate functions:

\`\`\`rust
// Generated at compile time (conceptually):
fn largest_i32(list: &[i32]) -> &i32 { /* ... */ }
fn largest_f64(list: &[f64]) -> &f64 { /* ... */ }
\`\`\`

Each version is fully specialized — no vtable lookups, no type erasure, no runtime dispatch. The generated assembly is identical to what you'd write by hand for each type.

## Static vs Dynamic Dispatch

Rust gives you a choice between static dispatch (monomorphization) and dynamic dispatch (trait objects):

\`\`\`rust
// Static dispatch — monomorphized, zero overhead
fn process_static(item: &impl Processor) {
    item.process();
}

// Dynamic dispatch — vtable lookup, small overhead
fn process_dynamic(item: &dyn Processor) {
    item.process();
}
\`\`\`

Static dispatch is the default and preferred approach. Dynamic dispatch (\`dyn Trait\`) is useful when you need heterogeneous collections or want to reduce binary size at the cost of a vtable indirection.

## The Binary Size Trade-off

Monomorphization has one downside: it can increase binary size. Each unique instantiation of a generic function generates its own copy in the final binary. For most applications this is negligible, but for embedded systems or WASM targets, it's worth considering.

## Iterators: The Ultimate Zero-Cost Abstraction

Rust's iterator combinators demonstrate zero-cost abstractions beautifully:

\`\`\`rust
let sum: i32 = (1..=1000)
    .filter(|n| n % 2 == 0)
    .map(|n| n * n)
    .sum();
\`\`\`

Despite looking like high-level functional programming, this compiles down to a single tight loop — no intermediate allocations, no function pointer indirections. The compiler fuses the entire chain into optimal machine code.

## Conclusion

Rust's zero-cost abstractions aren't marketing — they're a compile-time guarantee. By leveraging monomorphization, static dispatch, and aggressive inlining, Rust lets you write clean, generic code that performs identically to hand-optimized specializations. Understanding these mechanisms helps you make informed decisions about when to use generics vs trait objects, and why Rust can compete with C in performance-critical domains.
    `.trim(),
  },
];

// In-memory fallback database cache to allow CRUD operations even if the database is offline/unauthenticated
let memoryPosts: BlogPost[] = [...blogPosts];

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (post) return post;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to fetch post for slug "${slug}": ${errMsg}. Falling back to memory.`);
  }
  return memoryPosts.find((p) => p.slug === slug);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const dbPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (dbPosts.length > 0) {
      return dbPosts;
    }

    // Seed if empty and database is connected
    try {
      console.log("Database has 0 posts. Seeding initial posts...");
      await Promise.all(
        blogPosts.map((post) =>
          prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: {},
            create: {
              slug: post.slug,
              title: post.title,
              date: post.date,
              readTime: post.readTime,
              category: post.category,
              snippet: post.snippet,
              content: post.content,
            },
          })
        )
      );

      const seededPosts = await prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
      });
      return seededPosts;
    } catch (seedError) {
      const errMsg = cleanPrismaError(seedError);
      console.warn(`[Database Warning] Failed to seed database: ${errMsg}. Falling back to memory.`);
      return memoryPosts;
    }
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to fetch posts: ${errMsg}. Falling back to memory.`);
    return memoryPosts;
  }
}

export async function createPost(post: Omit<BlogPost, "id">): Promise<BlogPost> {
  try {
    const created = await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        date: post.date,
        readTime: post.readTime,
        category: post.category,
        snippet: post.snippet,
        content: post.content,
      },
    });
    // Sync to memory
    const memoryPost: BlogPost = { id: created.id, ...post };
    memoryPosts = [memoryPost, ...memoryPosts];
    return created;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to create post: ${errMsg}. Falling back to memory.`);
    const mockId = Math.random().toString(36).substring(2, 11);
    const mockPost: BlogPost = { id: mockId, ...post };
    memoryPosts = [mockPost, ...memoryPosts];
    return mockPost;
  }
}

export async function updatePost(slug: string, post: Partial<Omit<BlogPost, "id">>): Promise<BlogPost> {
  try {
    const updated = await prisma.blogPost.update({
      where: { slug },
      data: post,
    });
    // Sync to memory
    const idx = memoryPosts.findIndex((p) => p.slug === slug);
    if (idx !== -1) {
      memoryPosts[idx] = { ...memoryPosts[idx], ...post };
    }
    return updated;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to update post for slug "${slug}": ${errMsg}. Falling back to memory.`);
    const idx = memoryPosts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      throw new Error(`Post with slug ${slug} not found in memory fallback.`);
    }
    const updatedMockPost = { ...memoryPosts[idx], ...post };
    memoryPosts[idx] = updatedMockPost;
    return updatedMockPost;
  }
}

export async function deletePost(slug: string): Promise<BlogPost> {
  try {
    const deleted = await prisma.blogPost.delete({
      where: { slug },
    });
    // Sync to memory
    memoryPosts = memoryPosts.filter((p) => p.slug !== slug);
    return deleted;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to delete post for slug "${slug}": ${errMsg}. Falling back to memory.`);
    const idx = memoryPosts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      throw new Error(`Post with slug ${slug} not found in memory fallback.`);
    }
    const deletedMockPost = memoryPosts[idx];
    memoryPosts = memoryPosts.filter((p) => p.slug !== slug);
    return deletedMockPost;
  }
}

