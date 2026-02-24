<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ config('app.name') }}</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        .button-link { padding: 14px 32px !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #F7F9FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: none;">

{{-- ═══ OUTER WRAPPER ═══ --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7F9FB;">
    <tr>
        <td align="center" style="padding: 40px 16px;">

            {{-- ═══ MAIN CARD ═══ --}}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden;">

                {{-- ═══ HEADER ═══ --}}
                <tr>
                    <td style="background: linear-gradient(135deg, #0B1F3B 0%, #0f2c54 100%); padding: 28px 32px; text-align: center;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center">
                                    {{-- Brand Name --}}
                                    <a href="{{ config('app.url') }}" style="text-decoration: none;">
                                        <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.025em; color: #ffffff;">D'SERI</span><span style="font-size: 22px; font-weight: 800; letter-spacing: -0.025em; color: #3BAA35;">CORE</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-top: 6px;">
                                    <span style="font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 500;">Sericulture ERP &amp; eCommerce</span>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-top: 4px;">
                                    <span style="font-size: 9px; color: rgba(255,255,255,0.35); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">DMMMSU &bull; SRDI Official Portal</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- ═══ BODY ═══ --}}
                <tr>
                    <td style="padding: 36px 32px 20px 32px;">

                        {{-- Greeting --}}
                        <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: #0B1F3B; letter-spacing: -0.025em;">
                            @if (! empty($greeting))
                                {{ $greeting }}
                            @else
                                @lang('Hello!')
                            @endif
                        </h1>

                        {{-- Intro Lines --}}
                        @foreach ($introLines as $line)
                            <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 1.7; color: #4B5563;">{{ $line }}</p>
                        @endforeach

                        {{-- Time notice --}}
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #9CA3AF; font-weight: 500;">
                            &#128337; This link is valid for 60 minutes.
                        </p>
                    </td>
                </tr>

                {{-- ═══ ACTION BUTTON ═══ --}}
                @isset($actionText)
                <tr>
                    <td align="center" style="padding: 8px 32px 28px 32px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center" style="border-radius: 8px; background-color: #0B1F3B;">
                                    <a href="{{ $actionUrl }}" class="button-link" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: #0B1F3B; mso-padding-alt: 0; text-align: center;">
                                        <!--[if mso]><i style="mso-font-width: -100%; mso-text-raise: 21pt;">&nbsp;</i><![endif]-->
                                        <span style="mso-text-raise: 10pt;">{{ $actionText }}</span>
                                        <!--[if mso]><i style="mso-font-width: -100%;">&nbsp;</i><![endif]-->
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                @endisset

                {{-- ═══ OUTRO LINES ═══ --}}
                @if (! empty($outroLines))
                <tr>
                    <td style="padding: 0 32px 24px 32px;">
                        @foreach ($outroLines as $line)
                            <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.7; color: #4B5563;">{{ $line }}</p>
                        @endforeach
                    </td>
                </tr>
                @endif

                {{-- ═══ SECURITY NOTICE ═══ --}}
                <tr>
                    <td style="padding: 0 32px 28px 32px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px;">
                            <tr>
                                <td style="padding: 16px 20px;">
                                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #0B1F3B;">&#128274; Security Notice</p>
                                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #6B7280;">
                                        If you did not request this, you can safely ignore this email.<br>
                                        For security, do not share this link with anyone.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- ═══ SALUTATION ═══ --}}
                <tr>
                    <td style="padding: 0 32px 28px 32px;">
                        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1F2937;">
                            @if (! empty($salutation))
                                {{ $salutation }}
                            @else
                                @lang('Best regards,')
                                <br>
                                <span style="color: #3BAA35; font-weight: 700;">{{ config('app.name') }}</span>
                            @endif
                        </p>
                    </td>
                </tr>

                {{-- ═══ FALLBACK URL ═══ --}}
                @isset($actionText)
                <tr>
                    <td style="padding: 0 32px 28px 32px; border-top: 1px solid #F3F4F6;">
                        <p style="margin: 16px 0 8px 0; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
                            @lang("If you're having trouble clicking the \":actionText\" button, copy and paste the URL below into your web browser:", ['actionText' => $actionText])
                        </p>
                        <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px 12px; word-break: break-all;">
                            <a href="{{ $actionUrl }}" style="font-size: 11px; color: #3BAA35; text-decoration: none; word-break: break-all;">{{ $displayableActionUrl }}</a>
                        </div>
                    </td>
                </tr>
                @endisset

                {{-- ═══ FOOTER ═══ --}}
                <tr>
                    <td style="background-color: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 20px 32px; text-align: center;">
                        <p style="margin: 0; font-size: 11px; color: #9CA3AF; font-weight: 500;">
                            &copy; {{ date('Y') }} D'SERICORE &bull; SRDI / DMMMSU
                        </p>
                        <p style="margin: 4px 0 0 0; font-size: 10px; color: #D1D5DB;">
                            Don Mariano Marcos Memorial State University
                        </p>
                    </td>
                </tr>

            </table>
            {{-- END MAIN CARD --}}

        </td>
    </tr>
</table>
{{-- END OUTER WRAPPER --}}

</body>
</html>