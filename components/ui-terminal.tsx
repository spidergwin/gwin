"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { profileConfig } from "@/lib/config"

interface CommandLog {
  input?: string
  output: React.ReactNode
}

export function UiTerminal() {
  const { resolvedTheme, setTheme } = useTheme()
  const [history, setHistory] = useState<CommandLog[]>([
    {
      output: (
        <div>
          <span className="font-bold text-emerald-500">
            Welcome to my Interactive Shell.
          </span>
          <br />
          Type <span className="font-semibold text-amber-500">`help`</span> to
          see available commands.
        </div>
      ),
    },
  ])
  const [inputVal, setInputVal] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll only the terminal container, never the page
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [])

  const { hardwareConcurrency, userAgent, deviceMemory, platform } = navigator as any

  useEffect(() => {
    scrollToBottom()
  }, [history, scrollToBottom])

  const handleTerminalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    inputRef.current?.focus()
  }

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    let output: React.ReactNode

    if (!trimmed) {
      setHistory((prev) => [...prev, { input: "", output: "" }])
      return
    }

    // Store in command history for arrow-key navigation
    setCmdHistory((prev) => [...prev, trimmed])
    setCmdHistoryIdx(-1)

    switch (trimmed) {
      case "help":
        output = (
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm md:grid-cols-2">
            <div>
              <span className="font-semibold text-cyan-400">about</span> — Learn
              about Gwin
            </div>
            <div>
              <span className="font-semibold text-cyan-400">skills</span> —
              Technical expertise breakdown
            </div>
            <div>
              <span className="font-semibold text-cyan-400">projects</span> —
              Featured GitHub projects
            </div>
            <div>
              <span className="font-semibold text-cyan-400">contact</span> —
              Email, GitHub, and socials
            </div>
            <div>
              <span className="font-semibold text-cyan-400">neofetch</span> —
              System specs and dev info
            </div>
            <div>
              <span className="font-semibold text-cyan-400">theme</span> —
              Toggle dark / light mode
            </div>
            <div>
              <span className="font-semibold text-cyan-400">clear</span> — Clear
              terminal history
            </div>
            <div>
              <span className="font-semibold text-cyan-400">whoami</span> —
              Display current user
            </div>
          </div>
        )
        break
      case "about":
        output = (
          <p className="leading-relaxed">
            Hi, I&apos;m{" "}
            <strong className="text-white">{profileConfig.name} (Gwin)</strong>, a
            Software Engineer. I specialize in low-level systems programming, full-stack development, AI, mobile apps, and Web3 systems.
          </p>
        )
        break
      case "skills":
        output = (
          <div className="space-y-2">
            <div>
              <strong className="text-amber-400">Languages:</strong>{" "}
              {profileConfig.languages.map((l) => l.name).join(", ")}
            </div>
            <div className="space-y-1">
              <strong className="text-emerald-400">Specializations:</strong>
              {profileConfig.specializations.map((spec) => (
                <div key={spec.title} className="pl-4">
                  <strong className="text-[#a1a1aa]">- {spec.title}:</strong>{" "}
                  {spec.skills.join(", ")}
                </div>
              ))}
            </div>
          </div>
        )
        break
      case "contact":
        output = (
          <div className="space-y-1">
            {profileConfig.contactLinks.map((link) => (
              <div key={link.platform}>
                {link.platform}:{" "}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  {link.url.startsWith("mailto:") ? link.url.replace("mailto:", "") : link.url.replace("https://", "")}
                </a>
              </div>
            ))}
          </div>
        )
        break
      case "neofetch":
        output = (
          <div className="flex flex-col items-start gap-4 md:flex-row md:gap-8">
            <pre className="text-xs leading-none font-bold text-emerald-500 select-none">
              {`   _  _____
  | |/ ____|
  | | |  __
  | | | |_ |
_ | | |__| |
(_)__|_____|`}
            </pre>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-emerald-400">
                joseph@spidergwin
              </div>
              <div>-------------------------</div>
              <div>
                <strong className="text-cyan-400">Host: </strong>
                {userAgent ? userAgent : "Not recognized"}
              </div>
              <div>
                <strong className="text-cyan-400">Kernel: </strong>
                {platform ? platform : "GwinOS (web)"}
              </div>
              <div>
                <strong className="text-cyan-400">Uptime: </strong>
                {Math.floor(performance.now() / 1000)} sec
              </div>
              <div>
                <strong className="text-cyan-400">Shell: </strong>GwinSH
              </div>
              <div>
                <strong className="text-cyan-400">CPU: </strong>
                {hardwareConcurrency ? hardwareConcurrency : "2+"} cores
              </div>
              <div>
                <strong className="text-cyan-400">Memory: </strong>
                {deviceMemory ? `${deviceMemory}gb RAM` : ""}
              </div>
            </div>
          </div>
        )
        break
      case "projects":
        output = (
          <div className="space-y-2">
            {/* We will modify this later to fetch it directly from the github api and populate */}
            <div>
              <strong className="text-cyan-400">rusty-kernel</strong> —
              Monolithic kernel written in Rust targeting x86_64.
            </div>
            <div>
              <strong className="text-cyan-400">sys-mon</strong> — System
              monitoring tool reading procfs, written in Go and React.
            </div>
            <div>
              <strong className="text-cyan-400">compiler-in-go</strong> — Monkey
              Language interpreter and stack-based VM compiler.
            </div>
            <div className="text-muted-foreground">
              ↓ Scroll down to the Portfolio section for live repos!
            </div>
          </div>
        )
        break
      case "whoami":
        output = (
          <span className="font-semibold text-emerald-400">
            joseph (Gwin) — Software Engineer
          </span>
        )
        break
      case "theme":
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
        setTheme(nextTheme)
        output = (
          <span>
            Theme switched to{" "}
            <strong className="text-amber-400">{nextTheme}</strong> mode.
          </span>
        )
        break
      case "clear":
        setHistory([])
        setInputVal("")
        return
      default:
        output = (
          <span>
            <span className="text-red-400">
              GwinSH: {trimmed}: command not found
            </span>
            — type <span className="font-semibold text-amber-500">`help`</span>{" "}
            for available commands.
          </span>
        )
    }

    setHistory((prev) => [...prev, { input: cmd, output }])
    setInputVal("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent ALL default browser behavior (scrolling, form submission, etc.)
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      handleCommand(inputVal)
      return
    }

    // Arrow up: navigate command history backwards
    if (e.key === "ArrowUp") {
      e.preventDefault()
      e.stopPropagation()
      if (cmdHistory.length > 0) {
        const newIdx =
          cmdHistoryIdx === -1
            ? cmdHistory.length - 1
            : Math.max(0, cmdHistoryIdx - 1)
        setCmdHistoryIdx(newIdx)
        setInputVal(cmdHistory[newIdx])
      }
      return
    }

    // Arrow down: navigate command history forwards
    if (e.key === "ArrowDown") {
      e.preventDefault()
      e.stopPropagation()
      if (cmdHistoryIdx === -1) return
      const newIdx = cmdHistoryIdx + 1
      if (newIdx >= cmdHistory.length) {
        setCmdHistoryIdx(-1)
        setInputVal("")
      } else {
        setCmdHistoryIdx(newIdx)
        setInputVal(cmdHistory[newIdx])
      }
      return
    }
  }

  return (
    <div
      onClick={handleTerminalClick}
      className="flex h-80 w-full cursor-text flex-col overflow-hidden rounded-xl border border-[#2d2d30] bg-[#18181b] p-4 font-mono text-sm text-[#e4e4e7] dark:border-[#1e1e24] dark:bg-[#0c0c0e]"
    >
      {/* Title bar */}
      <div className="mb-3 flex shrink-0 items-center justify-between border-b border-[#2d2d30] pb-3 select-none">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <div className="h-3 w-3 rounded-full bg-[#eab308]" />
          <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <div className="text-xs text-[#a1a1aa]">
          systems-console — joseph@spidergwin:~
        </div>
        <div className="w-12" />
      </div>

      {/* Scrollable output area — scrolls independently of the page */}
      <div
        ref={scrollContainerRef}
        className="flex-1 scrollbar-thumb-secondary space-y-3 overflow-y-auto pr-1"
        style={{ overscrollBehavior: "contain" }}
      >
        {history.map((log, idx) => (
          <div key={idx} className="space-y-1">
            {log.input !== undefined && (
              <div className="flex items-start text-[#a1a1aa]">
                <span className="mr-1.5 shrink-0 font-semibold text-emerald-400">
                  joseph@spidergwin:~$
                </span>
                <span className="break-all">{log.input}</span>
              </div>
            )}
            {log.output !== "" && (
              <div className="whitespace-pre-wrap text-zinc-300">
                {log.output}
              </div>
            )}
          </div>
        ))}

        {/* Active input line */}
        <div className="flex items-center text-[#e4e4e7]">
          <span className="mr-1.5 shrink-0 font-semibold text-emerald-400 select-none">
            joseph@spidergwin:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            className="m-0 flex-1 border-none bg-transparent p-0 text-[#e4e4e7] caret-emerald-400 outline-none focus:ring-0 focus:outline-none"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            placeholder="Type your commands here."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
