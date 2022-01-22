# @plotdb/mail-queue

for queuing mails and mail templating



## Sample Template

use `yaml` format and `markdown` for `content`:

    from: '"#{orgname} Support" <noreply@#{domain}>'
    subject: 'Email Verification / #{domain}'
    content: |
      Hi #{username}!

      This is an email verification mail because someone used your email to sign up in #{domain} and requested an email verifiction.

      To verify your email, please open following link:

      [https://#{domain}/mail/verify/#{token}](https://#{domain}/mail/verify/#{token})

      This is an automatically generated mail so please don't reply in case that no one receive your mail.

      Best regards,
      #{orgname} team

possible fields:

 - `from`
 - `to`
 - `bcc`
 - `cc`
 - `subject`
 - `content`


## License

MIT
