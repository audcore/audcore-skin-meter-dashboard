function span(className, text = "") {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

export function bindHudChannelNav(navigation) {
  navigation.addEventListener("keydown", event => {
    const offsets = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, Home: -Infinity, End: Infinity };
    const offset = offsets[event.key];
    if (offset === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    const channels = [...navigation.querySelectorAll(".studio-channel-jump:not([hidden])")];
    const index = channels.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = channels[Math.max(0, Math.min(channels.length - 1, index + offset))];
    next.click();
    next.focus();
  });
}

export function arrangeHudChannel(row, controls, readout, toggles) {
  const routing = document.createElement("div");
  routing.className = "hud-routing";
  const routes = [row.input, row.output].map(control => {
    const route = document.createElement("div");
    const caption = span("hud-caption");
    route.append(caption, control);
    routing.append(route);
    return caption;
  });
  const gain = span("hud-caption");
  readout.prepend(gain);
  const peak = span("hud-peak", "—");
  const peakDisplay = document.createElement("div");
  peakDisplay.className = "hud-peak-display";
  peakDisplay.setAttribute("aria-hidden", "true");
  peakDisplay.append(span("hud-caption", "dBFS"), peak);
  controls.insertBefore(peakDisplay, toggles);
  row.insertSection.header.append(row.latency);
  row.item.replaceChildren(row.name, controls, routing, row.insertSection.group, row.sendSection.group);

  const signal = span("hud-signal");
  const fill = span("hud-signal-fill");
  signal.append(fill);
  signal.setAttribute("aria-hidden", "true");
  const states = span("hud-states");
  states.setAttribute("aria-hidden", "true");
  states.append(span("hud-mute", "M"), span("hud-solo", "S"), span("hud-rec", "●"));
  row.jump.append(states, signal);
  row.jump.tabIndex = -1;
  return { routes, gain, fill, peak };
}

export function updateHudChannel(row, t, gainLabel) {
  const { channel, jump, hud } = row;
  const language = document.documentElement.lang;
  const gain = t("增益");
  const chain = t("效果链");
  row.insertSection.caption.textContent = chain !== "效果链" ? chain :
    language === "en" ? "FX Chain" : language === "ja" ? "効果列" : chain;
  hud.gain.textContent = gain;
  hud.routes[0].textContent = t("输入");
  hud.routes[1].textContent = t("输出");
  row.gain.setAttribute("aria-label", `${gainLabel} · ${gain}`);
  const states = [
    ["muted", channel.muted, "channel.mute"],
    ["solo", channel.solo, "channel.solo"],
    ["recording", channel.recording || channel.recording_stopping, "channel.record"],
  ];
  const active = [];
  for (const [attribute, enabled, label] of states) {
    jump.toggleAttribute(`data-${attribute}`, Boolean(enabled));
    if (enabled) active.push(t(label));
  }
  jump.setAttribute("aria-label", [gainLabel, ...active].join(" · "));
}

export function paintHudMeter(row, level, reading) {
  row.hud.fill.style.transform = `scaleX(${level})`;
  if (row.hud.peak.textContent !== reading) row.hud.peak.textContent = reading;
  row.hud.peak.toggleAttribute("data-clip", Number(reading) > 0);
}
